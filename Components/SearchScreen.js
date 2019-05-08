import React, { Component } from 'react';
import { AppState, StyleSheet, View, Linking, Clipboard } from 'react-native';
import { Container, Header, Item, Spinner, Icon, Input, Title, H1, H2, H3, Content, List, ListItem, Thumbnail, Text, Left, Body, Right, Button, InputGroup } from 'native-base';

export default class MainScreen extends Component {

  // static navigationOptions = {
  //   title: '검색결과',
  //   headerRight: <Icon name='share' style={{ paddingRight:16 }}/>,
  //   headerStyle: {
  //     backgroundColor: '#f4511e',
  //   },
  //   headerTintColor: '#fff',
  //   headerTitleStyle: {
  //     fontWeight: 'bold',
  //   },
  // }
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      query: this.props.navigation.getParam('query', ''),
      mainItem: {},
      sameList: [],
      similarList: [],
      noResult : false,
    };
    this.searchInput = React.createRef();
    global.query = this.props.navigation.getParam('query', '');
  }

  componentDidMount() {
    this.findLowPrice(this.state.query);
  }

  findLowPrice = (shopUrl) => {
    this.setState({
      listLoaded: false,
      noResult : false,
    });

    return fetch('http://211.237.5.87:49002/lowprice_search?url='+encodeURIComponent(shopUrl))
      .then((response) => response.json())
      .then((responseJson) => {
        const result = responseJson.result;
        if(typeof result === 'undefined'){
          this.setState({
            listLoaded: true,
            noResult : true,
            mainItem : {},
            sameList : [],
            similarList: [],
          });
          return;
        }
        const _mainItem = result.query_info || {} ;
        const _sameList = _mainItem.same_item_list || [] ;
        const _similarList = result.data || [] ;
        if(_mainItem == {} || (_sameList.length == 0 && _similarList.length == 0)){
          this.setState({
            listLoaded: true,
            noResult : true,
            mainItem : {},
            sameList : [],
            similarList: [],
          });
          return;
        }

        this.setState({
          listLoaded: true,
          mainItem : _mainItem,
          sameList : _sameList,
          similarList: _similarList,
          naverList: result.naver.data || [],
        });

        const _name = _mainItem.name;
        if(typeof _name === 'string' ){
          this.setState({
            query: _name,
          });
        }
  
      })
      .catch((error) =>{
        console.error(error);
      });
  }

  intComma(a, b) {
    var val;
    if(typeof a === 'number' && typeof b === 'number'){
      val = Math.min(a, b);
    }else if( typeof a === 'undefined' && typeof b === 'number'){
      val = b;
    }else{
      val = a;
    }
    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (val + '');
    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');
    return n;
  }

  _onItemPress = (item) => {
    Linking.openURL(item.url);
  }
  _onSearchSubmit = (event) => {
    this.props.navigation.push('Search', { query: event.nativeEvent.text });
  };
  


  render() {
    let searchResult = <Spinner />;
    let noResult = <View style={{alignItems:'center', margin:24}}>
      <Text note>검색결과가 없습니다.</Text>
      <Text note>다른 주소나 상품명으로 시도해주세요.</Text>
    </View>;

    let mainItem;

    if(typeof this.state.mainItem.name === 'undefined'){
      mainItem =
        <Body style={{textAlign:'center', margin:16}}>
          <Thumbnail style={{width:180,height:320}} source={{ uri: this.state.mainItem.screenshot }} />
        </Body>;
    }else{
      mainItem =
        <Body style={{textAlign:'center', margin:16}}>
          <Thumbnail style={{width:100,height:100}} source={{ uri: this.state.mainItem.img }} />
          <Text style={{marginTop:8, textAlign:'center'}}>{this.state.mainItem.name.trim()}</Text>
          <H3 style={{marginTop:8,fontWeight:'bold'}}>￦{this.intComma(this.state.mainItem.low_price, this.state.mainItem.price)}</H3>
        </Body>;
    }

    let sameList =
      <List
        dataArray={this.state.sameList}
        renderRow={item =>
          <ListItem thumbnail
            style={{height:100}} 
            onPress={() => this._onItemPress(item)}>
            <Left style={{width:80}}>
              <Thumbnail style={{width:80, height:80, borderRadius:3}} square source={{ uri: item.img }} />
            </Left>
            <Body style={{height:80, paddingTop:0}} >
              <Text note style={{fontSize:11}}>{item.site_name.trim()}</Text>
              <Text style={{fontSize:13}} numberOfLines={1}>{item.name.trim()}</Text>
              <Text style={{fontSize:16,fontWeight:'bold', marginTop:4}}>￦{this.intComma(item.low_price, item.price)}</Text>
            </Body>
          </ListItem>
        }
      />;

      let similarList =
      <List
        dataArray={this.state.similarList}
        renderRow={item =>
          <ListItem thumbnail
            style={{height:140}} 
            onPress={() => this._onItemPress(item)}>
            <Left style={{width:120}}>
              <Thumbnail style={{width:120, height:120, borderRadius:3}} square source={{ uri: item.img }} />
            </Left>
            <Body style={{height:120, paddingTop:0}} >
              <Text note style={{fontSize:13}}>{item.site_name.trim()}</Text>
              <Text style={{fontSize:16}} numberOfLines={2}>{item.name.trim()}</Text>
              <Text style={{fontSize:20,fontWeight:'bold', marginTop:8}}>￦{this.intComma(item.low_price, item.price)}</Text>
            </Body>
          </ListItem>
        }
      />;


      let naverList =
        <List
          dataArray={this.state.naverList}
          renderRow={item =>
            <ListItem thumbnail
              style={{height:140}} 
              onPress={() => this._onItemPress(item)}>
              <Left style={{width:120}}>
                <Thumbnail style={{width:120, height:120, borderRadius:3}} square source={{ uri: item.img }} />
              </Left>
              <Body style={{height:120, paddingTop:0}} >
                <Text style={{fontSize:16}} numberOfLines={2}>{item.name.trim()}</Text>
                <Text style={{fontSize:20,fontWeight:'bold', marginTop:8}}>￦{this.intComma(item.low_price, item.price)}</Text>
              </Body>
            </ListItem>
          }
        />;
      
    if(this.state.listLoaded){
      if(this.state.noResult) searchResult = noResult;
      else{
        searchResult = <Content>
          {mainItem}
          <Item>
            <Body style={{textAlign:'center', margin:16}}>
              <Text style={{marginTop:8}}>가격비교 <Text note>{this.state.sameList.length}</Text></Text>
            </Body>
          </Item>
          {sameList}
          <Item>
            <Body style={{textAlign:'center', margin:16}}>
              <Text style={{marginTop:8}}>비슷한 상품 <Text note>{this.state.similarList.length}</Text></Text>
            </Body>
          </Item>
          {similarList}
          <Item>
            <Body style={{textAlign:'center', margin:16}}>
              <Text style={{marginTop:8}}>네이버 상품 <Text note>{this.state.naverList.length}</Text></Text>
            </Body>
          </Item>
          {naverList}
        </Content>;
      }
    }

    return (
      <Container style={styles.container}>
        <Header searchBar style={styles.header}>
          <Left style={{flex: null, paddingRight:8}}>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back"/>
            </Button>
          </Left>
          <Item>
            <Icon name="ios-search" />
              <Input 
                placeholder="상품주소, 상품명 검색" 
                ref={this.searchInput}
                value={this.state.query}
                onChangeText={(text) => this.setState({query:text})}
                onSubmitEditing={this._onSearchSubmit}/>
                {this.state.query.length > 0 &&
                  <Icon name="close" onPress={() => {
                    this.setState({query:''})
                    this.searchInput.current._root.clear();
                  }}/>
                }
          </Item>
        </Header>
        {searchResult}
      </Container>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // borderStyle: 'solid',
    // borderTopWidth: Constants.statusBarHeight,
    // borderTopColor: '#7618D5',
  },
  header: {
    // backgroundColor: '#7618D5'
  }
});