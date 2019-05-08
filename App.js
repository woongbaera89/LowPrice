import { createStackNavigator, createAppContainer } from "react-navigation";
import MainScreen from './Components/MainScreen';
import SearchScreen from './Components/SearchScreen';

console.disableYellowBox = true;
const AppStackNavigator = createStackNavigator(
  {
    Main:{
      screen: MainScreen 
    },
    Search:{
      screen: SearchScreen 
    }
  }, 
  {
    initialRouteName: "Main"
  }
);

export default createAppContainer(AppStackNavigator);
