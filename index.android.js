import React, {
   Component,
 } from 'react';
 import {
  AsyncStorage,
  AppRegistry,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  Animated,
  PanResponder
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import { View, Platform } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import SplashScreen from 'react-native-splash-screen';
import CircleButton from 'react-native-circle-button';

import openSocket from 'socket.io-client';
import RNFS from 'react-native-fs';

import futch from './src/components/Futch';
import Button from './src/components/Button';
import Container from './src/components/Container';

const MAX_POINTS = 100;
const myIcon = (<Icon name="rocket" size={30} color="#900" />)
var myStore = '';
var myStorePaths = '';
var primaryFontSize = 16;
var serverCommunicationIP = 'http://192.168.43.66:5008';
var serverTransmissionIP = 'http://192.168.43.66:5007';
// var downloadProgress = (response) => {
//   var percentage = Math.floor((response.totalBytesSent/response.totalBytesExpectedToSend) * 100);
//   console.log('UPLOAD IS ' + percentage + '% DONE!');
// }

console.ignoredYellowBox = [
    'Setting a timer'
]

const originalFetch = fetch
global.fetch = (url, opts) => {
  console.log(opts.onProgress)
  if (opts.onProgress && typeof opts.onProgress === 'function') {
    return futch(url, opts, opts.onProgress)
  } return originalFetch(url, opts)
}

class Synced extends Component {
  constructor() {
    super();
    this.state = {
      isMoving: false,
      points: 0.5,
      stored: '',
      currentFile: 'N/A',
      writePath: '',
      manifestReceived: false,
      componentReceived: false,
      prevWritePath: '',
      musicManifest: '',
      musicPaths: '',
      booksManifest: '',
      booksPaths: '',
      lecturesManifest: '',
      lecturesPaths: '',
      activeTransfers: false,
      transfersCompleted: false
    };
  }

  componentDidMount = () => {
    SplashScreen.hide();
    this.runner();
    const socket = openSocket(serverCommunicationIP);
    socket.on('connect', () => {
      socket.on('progress', (msg) => {
        console.log('Progress: ' + msg);
        this.setState({points: msg/100});
      });
      socket.on('fileName', (msg) => {
        this.setState({currentFile:msg});
      });
    });
  }
  runner = () => {
    this.readDirectory('/storage/emulated/0/Music', '', 1, '')
    .then((result) =>{
      this.readDirectory('/storage/emulated/0/Books', '', 2, '');
    }).then(() =>{
      this.readDirectory('/storage/emulated/0/Download/','', 3, '');
    }).catch((error) =>  {
      alert(err.message, err.code);
    });
  }

  readDirectory = (path, store, val, storePaths) => {
    return new Promise((resolve, reject) => {
      RNFS.readDir(path) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then((result) => {
        result.forEach(obj => {
          str = JSON.stringify(obj.name).replace(/['"]+/g, '');
          temp = path + '/' + str;
          if(obj.isFile()){
            store += str + '\n';
            storePaths += temp + '\n';
            this.setState({currentFile:str});
          }else{
            this.state.points = this.state.points/2;
            this.readDirectory(temp,store,val,storePaths);
          }
        });
        this.state.points*=2;
        if(this.state.points > 1)
          this.state.points = 1;

        if(val == 1){
          this.state.musicManifest += store;
          this.state.musicPaths += storePaths;
        }
        if(val == 2){
          this.state.booksManifest += store;
          this.state.booksPaths += storePaths;
        }
        if(val == 3){
          this.state.lecturesManifest += store;
          this.state.lecturesPaths += storePaths;
        }

        if(this.state.points >= 1){
          this.state.currentFile = 'Done';
        }
        resolve(store);
      }).catch((err) => {
        alert(err.message, err.code);
      })
    });
  }

  writeFile = (path, encoding, data) => {
    RNFS.writeFile(path, data, encoding)
      .then((success) => {
        console.log('Success')
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  addToManifest = (component, store) => {
    if(component == 'Music')
      this.state.musicManifest = this.state.musicManifest + store + '\n';
    if(component == 'Books'){
      this.state.booksManifest = this.state.booksManifest + store + '\n'
      alert(this.state.booksManifest);
    }
    if(component == 'Lectures')
      this.state.lecturesManifest = this.state.lecturesManifest + store + '\n'
  }

  downloadFile = (component) => {
    //alert('Download File');
    var wP = this.state.writePath;
    this.state.activeTransfers = true;
    RNFS.downloadFile({
      fromUrl: serverTransmissionIP,
      toFile: this.state.writePath,
    }).promise.then((response) => {
      this.state.activeTransfers = false;
      this.addToManifest(component,wP.substr(wP.lastIndexOf("/")+1, wP.length));
      this.setState({points:0});
      this.setState({currentFile: 'Done'});
    }).catch((err) => {
      alert(err);
      this.state.activeTransfers = false;
      this.state.prevWritePath = '';
      RNFS.unlink(wP)
      .then(() => {
        this.setState({currentFile: 'File Deleted'});
        console.log('FILE DELETED');
        this.downloadFile(val);
      })
      .catch((err) => {
        console.log(err.message);
      });
    });
  }

  makeDirectory = (path, component) => {
    //alert('mD: ' + this.state.writePath);
    RNFS.exists(path.substr(0, path.lastIndexOf("/"))).then((result) => {
      if(!result){
        this.makeDirectory(path.substr(0, path.lastIndexOf("/")));
        RNFS.mkdir(path.substr(0, path.lastIndexOf("/")));
      }
      if(path == this.state.writePath && this.state.writePath != this.state.prevWritePath){
        this.downloadFile(component);
        this.state.prevWritePath = this.state.writePath;
      }
    }).catch((err)=> {
      console.log(err);
    });
  }

  resetVariables = () => {
    this.state.writePath = '';
    this.state.prevWritePath = '';
    this.state.manifestReceived = false;
    this.state.componentReceived = false;
    this.state.activeTransfers = false;
    this.state.transfersCompleted = false;
  }

  handleDownload = (path, component) => {
    this.resetVariables();
    const socket = openSocket(serverCommunicationIP);
    socket.on('connect', () => {
      socket.emit('component', component);
      if(component == 'Music')
        socket.emit('manifest', this.state.musicManifest);
      if(component == 'Books')
        socket.emit('manifest', this.state.booksManifest);
      if(component == 'Lectures')
          socket.emit('manifest', this.state.lecturesManifest);

      socket.on('manifestReceived', (msg) => {
        this.state.manifestReceived = true;
      });

      socket.on('componentReceived', (msg) => {
        this.state.componentReceived = true;
      });
      socket.on('progress', (msg) => {
        console.log('Progress: ' + msg);
        this.setState({points: msg/100});
      });

      socket.on('fileName', (msg) => {
        this.setState({currentFile:msg});
      });

      socket.on('serverDisconnected', (msg) => {
        alert('Server disconnected');
        if (msg)
          this.setState({prevWritePath: ''});
      });
      socket.on('transferComplete', (msg) => {
        this.state.transfersCompleted = msg;
        if(this.state.manifestReceived == false){
          if(component == 'Music')
            socket.emit('manifest', this.state.musicManifest);
          if(component == 'Books')
            socket.emit('manifest', this.state.booksManifest);
          if(component == 'Lectures')
              socket.emit('manifest', this.state.lecturesManifest);
        }
        if(this.state.componentReceived == false){
          socket.emit('component', this.state.component);
        }
        socket.on('savePath', (msg) => {
          this.state.writePath = path + msg;
          this.state.writePath = this.state.writePath.replace(/\s*$/,"");
        });

        if(msg == false && this.state.manifestReceived == true && this.state.componentReceived == true){
          if(/\S/.test(this.state.writePath)){
            if(this.state.prevWritePath != this.state.writePath && this.state.activeTransfers == false){
              this.makeDirectory(this.state.writePath, component);
            }
          }
        }
      })
      socket.on('savePath', (msg) => {
        this.state.writePath = path + msg;
        this.state.writePath = this.state.writePath.replace(/\s*$/,"");
      });
    });

    socket.on('disconnect', () =>{
      alert('disconnected')
      if(this.state.transfersCompleted == false){
        this.handleDownload(path,component);
      }
      this.resetVariables();
    });
  }

  fileUpload = (path) => {
    data.append('name', 'testName');
    data.append('photo', {
      uri: source.uri,
      name: 'testPhotoName'
    });
    fetch(url, {
      method: 'post',
      body: data,
      onProgress: (e) => {
        const progress = e.loaded / e.total;
        console.log(progress);
        this.setState({
          progress: progress
        });
      }
    }).then((res) => console.log(res), (e) => console.log(e))
  }

  handleUpload = (component) => {
    alert(component);
    const socket = openSocket(serverCommunicationIP);
    if (component ==  'Music')
      socket.emit('uploadManifest', this.state.musicPaths);
    if (component ==  'Books')
      socket.emit('uploadManifest', this.state.booksPaths);
    if (component ==  'Lectures')
      socket.emit('uploadManifest', this.state.lecturesPaths);
    socket.emit('uploadComponent', component);
    socket.on('upload', (path) => {
        this.fileUpload(path)
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style ={{backgroundColor: 'rgba(28, 28, 28, 0.9)', width: 400, position: 'absolute', top: 0, height: 70, padding: 20}}>
          <Text style={styles.textStyle}><Image source={require('./src/images/ic_launcher.png')} style={{width: 45, height: 45}} /> SYNCED</Text>
        </View>
        <View style={styles.container}>
          <AnimatedCircularProgress
            size={200}
            width={6}
            fill={this.state.points*MAX_POINTS}
            tintColor="#3d5875"
            backgroundColor="#FFBE2C">
            {
              (fill) => (
                <Text style={styles.points}>
                  { this.state.currentFile }
                </Text>
              )
            }
          </AnimatedCircularProgress>
          <Text style={[styles.pointsDelta, this.state.isMoving && styles.pointsDeltaActive]}>
            { this.state.points >= 0 }
            { Math.round(this.state.points* MAX_POINTS) }
            %
          </Text>

          <AnimatedCircularProgress
            size={180}
            width={4}
            fill={this.state.points*MAX_POINTS}
            tintColor="#FFE12E"
            backgroundColor="#3d5875"
            style = {styles.circularProgress}>
          </AnimatedCircularProgress>
        </View>
        <View style = {styles.containerNew}>
          <View style={styles.buttonContainer}>
            <CircleButton size={60}
             primaryColor = {'#FFFFFF'}
             secondaryColor={'rgba(61, 88, 117 ,0.35)'}
             onPressButtonTop={() => this.handleDownload('/storage/emulated/0/Music','Music')}
             onPressButtonLeft={() => this.handleDownload('/storage/emulated/0/Download','Lectures')}
             onPressButtonRight={() => this.handleDownload('/storage/emulated/0/Books','Books')}
            />
            <Text style={styles.buttonBlackText}>
                Download
            </Text>
          </View>
          <View style={styles.buttonContainer}>
              <CircleButton size={60}
                primaryColor = {'#FFFFFF'}
                secondaryColor={'rgba(61, 88, 117 ,0.35)'}
                onPressButtonTop={() => this.handleUpload('Music')}
               />
              <Text style={styles.buttonBlackText}>
                  Upload
              </Text>
          </View>
        </View>
        <View  style ={{backgroundColor: 'rgba(28, 28, 28, 0.9)', width: 400, position: 'absolute', bottom: 0, height: 30, padding: 5}}>
          <View><Text style={styles.textStyleFooter}><Image source={require('./src/images/ic_launcher.png')} style={{width: 20, height: 20}}/>  Synced @2017</Text></View>
        </View>
      </View>
    )}
}

const styles = StyleSheet.create({
    points: {
      backgroundColor: 'transparent',
      position: 'absolute',
      top: 72,
      left: 56,
      width: 90,
      textAlign: 'center',
      color: '#7591af',
      fontSize: primaryFontSize,
      fontWeight: "100"
    },
    buttonWhiteText: {
        fontSize: 20,
        color: '#FFF',
    },
    buttonBlackText: {
        fontSize: 20,
        paddingLeft: 40,
        alignRight: 50,
        fontFamily: 'Aileron',
        color: '#595856'
    },
    primaryButton: {
      flex: 1,
      width: 120,
      height: 120,
      borderWidth: 1,
      borderColor: 'black'
    },
    secondaryButton: {
      marginTop: 20,
      height: 100,
      width: 250,
      borderWidth: 1,
      borderColor: 'black'
    },
    textStyle: {
      color:  'rgba(256, 256, 256, 0.8)',
      fontFamily: 'Bebas Neue',
      fontWeight: '700',
      fontSize:   24,
      textAlign: 'center',
      alignSelf: 'center'
    },
    textStyleFooter: {
      color:  'rgba(256, 256, 256, 0.8)',
      fontFamily: 'Bebas Neue',
      fontWeight: '700',
      fontSize:   13,
      textAlign: 'center',
      alignSelf: 'center'
    },
    backgroundImage: {
      flex: 1,
      resizeMode: 'cover', // or 'stretch'
    },
    containerNew: {
      flex: 1,
      marginTop: 100,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContainer: {
      flex: 1,
      alignItems: 'center'
    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 50
    },
    pointsDelta: {
      color: '#4c6479',
      fontSize: 50,
      fontWeight: "100"
    },
    pointsDeltaActive: {
      color: '#fff',
    },
    circularProgress: {
      position: 'absolute',
      top : 60,
      left: 60,
    },
    quarterHeight: {
        flex: 15,
        backgroundColor: '#FF3366'
    },
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
      color: '#fff',
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

AppRegistry.registerComponent('Synced', () => Synced);
