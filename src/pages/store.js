import React, { useEffect, Fragment, useState } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { actions as storeActions } from 'core/reducers/store'
import {
  Segment,
  Loader,
  Header,
  Card,
  Icon,
  Image,
  Label,
  Button,
  Checkbox,
  Select,
  Pagination
} from 'semantic-ui-react'
import moment from 'moment'
import './projects.css'

const
  kindOptions = {
    'fav': 'Best Of',
    'edu': 'Education',
    'others': 'Autres'
  },
  orderOptions = {
    'MOST_RECENT': 'Les plus récentes',
    'MOST_VIEWED': 'Les plus vues',
    'BEST_RATED': 'Les mieux notées',
    'MOST_LONG': 'Les plus longues',
    'MOST_SHORT': 'Les plus courtes'
  },
  orderOptionsSelect = Object.keys(orderOptions).map(k => ({key: k, value: k, text: orderOptions[k]}))

const Store = (props) => {
  const {
    pending,
    error,
    stories,
    getList,
    download
  } = props

  const
    [searchParams, setSearchParams] = useState({
      page: 0,
      childrenOnly: false,
      allLangs: false,
      kind: Object.keys(kindOptions)[0],
      category: null,
      order: null
    }),
    [categories, setCategories] = useState([])

  useEffect(() => {
    getList(searchParams)
  }, [getList, searchParams])

  useEffect(() => {
    if (categories.length === 0 && stories !== null) {
      setCategories(stories.categories)
    }
  }, [stories, setCategories, categories])

  return (
    <Fragment>
      <div className="module-header" style={{height: 270}}>
        <div style={{paddingTop: 20, textAlign: 'center'}}>
          <Header size="huge">Moiki Store</Header>
          <div style={{padding: 5}}>
            <Button.Group>{
              Object.keys(kindOptions).map(
                k => <Button key={'button-kind-' + k}
                             className={k === searchParams.kind ? 'primary' : ''}
                             onClick={() => setSearchParams(params => ({
                               ...params,
                               kind: k === params.kind ? null : k,
                               page: 0
                             }))}>{kindOptions[k]}</Button>)
            }</Button.Group>
          </div>
          <div style={{padding: 5}}>
            <Checkbox style={{padding: 10}}
                      label="Afficher les histoires de toutes les langues"
                      onClick={(e, data) => setSearchParams(params => ({
                        ...params,
                        allLangs: data.checked,
                        page: 0
                      }))}/>
            <Checkbox style={{padding: 10}}
                      label="Afficher uniquement les histoires pour les enfants"
                      onClick={(e, data) => setSearchParams(params => ({
                        ...params,
                        childrenOnly: data.checked,
                        page: 0
                      }))}/>
            <Select placeholder="Trier selon"
                    options={orderOptionsSelect}
                    onChange={(e, data) => setSearchParams(params => ({
                      ...params,
                      order: data.value,
                      page: 0
                    }))}/>
          </div>
          <div style={{padding: 5}}>
            <Button.Group>{
              categories.map(
                c => <Button key={'button-category-' + c}
                             className={c === searchParams.category ? 'primary' : ''}
                             onClick={() => setSearchParams(params => ({
                               ...params,
                               category: c === params.category ? null : c,
                               page: 0
                             }))}>{c}</Button>)
            }</Button.Group>
          </div>
          <div style={{padding: 5}}>
            <Pagination activePage={searchParams.page + 1}
                        onPageChange={(e, page) => setSearchParams(params => ({
                          ...params,
                          page: page.activePage - 1
                        }))}
                        totalPages={stories !== null ? Math.ceil(stories.total / stories.resPerPage) : 0}/>
          </div>
        </div>
      </div>
      <div style={{paddingTop: 270}}>
        {error && (
          <Segment className="error-message" color="red">
            Une erreur est survenue :-(
          </Segment>
        )}
        <div style={{textAlign: 'center'}}>
          {pending ? (
            <Loader active={true}/>
          ) : (
            <div style={{justifyContent: 'center', display: 'flex', flexWrap: 'wrap'}}>
              {stories && stories.results && stories.results.length > 0 ? stories.results.map((story, idx) => (
                <Card key={'story-' + idx} className="project-card"
                      onClick={() => {download(story.socialClubData.slug)}}>
                  {story.image ? (
                    <Image style={{maxHeight: 225, overflow: 'hidden', cursor: 'pointer'}} wrapped ui={false}>
                      <div className="cover" style={{backgroundImage: 'url(' + story.image + ')'}}/>
                    </Image>
                  ) : (
                    <Image src={'/assets/image-wireframe.png'} wrapped ui={false}
                           style={{height: 225, display: 'flex', cursor: 'pointer'}}/>
                  )}
                  <Label ribbon color="blue" style={{position: 'absolute', left: -14, top: 10}}>
                    <Icon name="download"/> Télécharger
                  </Label>
                  <Card.Content extra header={story.name}/>
                  <Card.Content extra>
                    <div className="social-stats"><Icon
                      name="calendar alternate"/> {moment(story.creationDate).fromNow()}</div>
                    <div className="social-stats"><Icon
                      name="bookmark"/> {story.socialClubData.category.replace(/(?<= )[^\s]|^./g, a => a.toUpperCase())}
                    </div>
                  </Card.Content>
                  <Card.Content extra>
                    <div className="social-stats"><Icon name="star"/> {story.socialClubData.rate.toFixed(1)} / 5</div>
                    <div className="social-stats"><Icon name="eye"/> {story.socialClubData.numViews}</div>
                    <div className="social-stats"><Icon name="talk"/> {story.commentCount}</div>
                  </Card.Content>
                </Card>
              )) : (
                <p>Auncune histoire n'a été trouvé. Commencez par en importer une&nbsp;!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  pending: state.store.pending,
  error: state.store.error,
  stories: state.store.list
})

const mapDispatchToProps = (dispatch) => ({
  getList: bindActionCreators(storeActions.getList, dispatch),
  download: bindActionCreators(storeActions.download, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Store)
