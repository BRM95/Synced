import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Image,
  resizeMode,
  Dimensions
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { StackNavigator } from 'react-navigation';

import Container from '../components/Container';
import Button from '../components/Button';
import Label from '../components/Label';
import Background from '../components/Background';
//import router from '../Router';

let width = Dimensions.get('window').width

export default class Select extends Component {
  constructor(props){
    super(props)
    const { state } = this.props.navigation;
    var usernameNew = state.params ? state.params.username : "<undefined>"
    var makeNew = state.params ? state.params.make : "<undefined>";
    var modelNew = state.params ? state.params.model : "<undefined>";
    var plateNew = state.params ? state.params.plate : "<undefined>";
    var latitude = state.params ? state.params.latitude : 46
    var longitude = state.params ? state.params.longitude : 25
    this.state = {
      username: usernameNew,
      make: makeNew,
      model: modelNew,
      plate: plateNew,
      latitude: latitude,
      longitude: longitude
    }
  }
  handlePressPassenger = () => {
    const data = {
     username: this.state.username,
     make: this.state.make,
     model: this.state.model,
     plate: this.state.plate,
     latitude: this.state.latitude,
     longitude: this.state.longitude,
    }
    const json = JSON.stringify(data);
    fetch('http://192.168.122.1:3000/passenger', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: json
    }).then((response) => response.json().then(function(responseData) {
            error = responseData.error;
          })).then(() => {
            if(!error){
              this.props.navigation.navigate("passengerScreen",
              {
                make: this.state.make,
                model: this.state.model,
                plate: this.state.plate,
                username: this.state.username,
                latitude: this.state.latitude,
                longitude: this.state.longitude
              });
            }else{
            alert('Email Address is already in use')
          }}).catch((error) => {
              alert(error);
       }).done();
  }
  handlePressDriver = () => {
    const data = {
      username: this.state.username,
      make: this.state.make,
      model: this.state.model,
      plate: this.state.plate,
      latitude: this.state.latitude,
      longitude: this.state.longitude,
    }
    const json = JSON.stringify(data);
    fetch('http://192.168.122.1:3000/driver', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: json
    }).then((response) => response.json().then(function(responseData) {
            error = responseData.error;
          })).then(() => {
            if(!error){
              this.props.navigation.navigate("driverScreen",
              {
                make: this.state.make,
                model: this.state.model,
                plate: this.state.plate,
                username: this.state.username,
                latitude: this.state.latitude,
                longitude: this.state.longitude
              });
            }else{
            alert('Email Address is already in use')
          }}).catch((error) => {
              alert(error);
       }).done();
  }

  render() {
    return (
      <View style={styles.main}>
        <View style={styles.scroll}>
          <Container>
              <Text style={styles.textStyle}>Choose an Option Below</Text>
              <Button
                  label="Driver"
                  styles={{button: styles.circularButton, label: styles.buttonWhiteText}}
                  onPress={() =>  this.handlePressDriver()} />
              <Button
                  label="Passenger"
                  styles={{button: styles.circularButton, label: styles.buttonWhiteText}}
                  onPress={() => this.handlePressPassenger()} />
          </Container>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    main: {
      backgroundColor: '#ECECEC',
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1
    },
    buttonBlackText: {
        fontSize: 20,
        color: '#595856'
    },
    backgroundImage: {
        flex: 1,
        top: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        left: 0,
        position: 'absolute',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    textStyle: {
      color: '#595856',
      fontFamily: 'Bebas Neue',
      fontWeight: '700',
      fontSize:   30,
      textAlign: 'center',
      alignSelf: 'center'
    },
    circularButton: {
      flexDirection: 'row',
      marginTop: 50,
      width: 150,
      borderWidth: 2,
      backgroundColor:'#d73352',
      marginLeft: Dimensions.get('window').width/4,
      height: 150,
      borderRadius: 100
    },
    scroll: {
        flex:1,
        padding: 30
    },
    label: {
        color: '#0d8898',
        fontSize: 20
    },
    alignRight: {
        alignSelf: 'flex-end'
    },
    textInput: {
      height: 80,
      fontSize: 30,
      backgroundColor: '#FFF',
      borderRadius: 10
    },
    buttonWhiteText: {
        fontSize: 20,
        color: '#FFF',
    },
    alert: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
      fontWeight: 'bold'
    },
    inline: {
        flexDirection: 'row'
    },
    footer: {
       marginTop: 30
    }
});
