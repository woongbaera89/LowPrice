import React, { Component } from 'react';
import { AppState, StyleSheet, View, Clipboard } from 'react-native';
import { Container, Header, Item, Spinner, Icon, Input, Title, H1, H2, H3, Content, List, ListItem, Thumbnail, Text, Left, Body, Right, Button, InputGroup } from 'native-base';

import ShareMenu from 'react-native-share-menu';
import { StackActions, NavigationActions } from 'react-navigation';

const resetAction = StackActions.reset({
  index: 1
});

export default class MainScreen extends Component {

  // static navigationOptions = {
  //   title: '로프 - 최저가검색',
  //   headerRight: <Icon name='send' style={{ paddingRight:10 }}/>,
  // }
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      query: '',
      //http://deal.11st.co.kr/product/SellerProductDetail.tmall?method=getSellerProductDetail&prdNo=2211431334
    };
    this.searchInput = React.createRef();
    global.query = '';
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    this.checkShare('mount');
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      this.checkShare('fore');
    }
    this.setState({appState: nextAppState});
  };

  checkShare = (type) =>{
    ShareMenu.getSharedText((text) => {
      if (text && text.length) {
        if (text.startsWith('content://media/')) {
        } else {
          if(global.query != text){
            global.query = text;
            Clipboard.setString(text);
            this.props.navigation.navigate('Search', { query: text });
          }          
        }
      }
      ShareMenu.clearSharedText();
    });
  }

  _onSearchSubmit = (event) => {
    //this.setState({ query: event.nativeEvent.text });
    this.props.navigation.navigate('Search', { query: event.nativeEvent.text });
  };

  _onPressClipboard = async () => {
    var text = await Clipboard.getString();
    this.setState({
      query: text
    });

    this.props.navigation.navigate('Search', { query: text });
  };

  render() {
    return (
      <Container style={styles.container}>
        <View style={{marginBottom:24}}>
          <H1>최저가검색</H1>
          <H1>로우프라이스</H1>
        </View>
        <Item>
          <Icon active name="search" />
          <Input 
            ref={this.searchInput}
            onChangeText={(text) => this.setState({query:text})}
            onSubmitEditing={this._onSearchSubmit}
            value={this.state.query}
            placeholder='상품주소, 상품명 검색' />
            {this.state.query.length > 0 &&
              <Icon name="close" onPress={() => {
                this.setState({query:''})
                this.searchInput.current._root.clear();
              }}/>
            }
        </Item>
        <Button small transparent 
        style={{marginTop:10,alignSelf: 'center'}}
        onPress={() => this._onPressClipboard()}>
          <Text>클립보드에서 가져오기</Text>
        </Button>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:24,
    justifyContent: 'center',
  },
});