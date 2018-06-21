import React, { Component } from 'react'
import MapView from 'react-native-maps';
import {
   StyleSheet,
   Dimensions
} from 'react-native'

const Maps = (props) => {
   return (
      <MapView
         style = {styles.map}
         showsUserLocation = {true}
         followUserLocation = {true}
         zoomEnabled = {true}
         initialRegion={{
           latitude: 40.77096,
           longitude: -73.97702,
           latitudeDelta: 0.0491,
           longitudeDelta: 0.0375,
         }}
      />
   )
}

const styles = StyleSheet.create ({
   map: {
     width: Dimensions.get('window').width,
     height: Dimensions.get('window').height/1.4
   }
})

export default Maps;
