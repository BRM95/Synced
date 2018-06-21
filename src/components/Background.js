import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  Dimensions
} from 'react-native';

const Background = (props) => {
    return (
      <View>
        <Image source={require('../images/backgroundImage.jpg')}
              style={styles.backgroundImage}>
              {props.children}
        </Image>
      </View>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        top: 0,
        left: 0,
        position: 'absolute',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    }
});
export default Background;
