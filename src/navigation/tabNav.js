import React, { Component } from 'react';
import { TabNavigator, TabView } from 'react-navigation'
import Icon from "react-native-vector-icons/FontAwesome";
import stackNav from './stackNav';

const tabNav = TabNavigator({
    TabItem1: {
        screen: stackNav,
        navigationOptions:({navigation}) => ({
          headerStyle: { paddingRight: 10, paddingLeft: 10, display: 'none'}
        })
    }
},
{
        tabBarOptions: {
            activeTintColor: '#222',
        }
});

export default tabNav;
