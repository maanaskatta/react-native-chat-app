import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView, Modal, Image, Dimensions, YellowBox, Alert} from 'react-native';
import {Input,Button, Icon} from 'react-native-elements';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Permission from 'expo-permissions';
import Expo, {Notifications} from 'expo';


import {db, imgDb} from '../src/config';


async function register()
{
    const {status} = await Permission.askAsync(Permission.NOTIFICATIONS);
    //console.log(status);
    
    if(status !== 'granted')
    {
        alert("You have not enabled notification permission!");
        return;
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token;   

}



class Registration extends Component
{
    constructor(props)
    {
        super(props);
        YellowBox.ignoreWarnings(['Setting a timer']);
        this.state={
            usersList : [],
            firstName : '',
            lastName : '',
            mobileNum : '',
            email : '',
            newPassword : '',
            conPassword : '',
            modalOpen: false,
            imageUrl : '',
            dpUri : 'https://firebasestorage.googleapis.com/v0/b/make-your-brunch-c3580.appspot.com/o/uploads%2Fdp.png?alt=media&token=2d4d6e69-3b6a-4533-ac52-e09551dcee1e'
        }
    }

    componentDidMount = () => {
        db.ref('/users').on('value', querySnapShot => {
            let data = querySnapShot.val() ? querySnapShot.val() : {};
            let userAuthData = {...data};
            

            this.setState({
                usersList : Object.values(userAuthData)
            });

        });
    }


    validateUserData = () =>
    {
        
        var phoneno = /^\d{10}$/;
        var emailCheck = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if(this.state.firstName.length == 0 || this.state.lastName.length  == 0)
        {
            Alert.alert(
                "",
                "Firstname and Lastname cannot be empty!",
            );
        }
        else if(!this.state.mobileNum.match(phoneno))
        {
            Alert.alert(
                "",
                "Enter a valid phone number!",
            );
        }
        else if(!this.state.email.match(emailCheck))
        {
            Alert.alert(
                "",
                "Enter a valid Email Id",
            );
        }
        else if(this.state.newPassword.length <= 6)
        {
            Alert.alert(
                "",
                "Password must be atleast 6 characters long!",
            );
        }
        else if(!(this.state.newPassword === this.state.conPassword))
        {
            Alert.alert(
                "",
                "Passwords doesn't match!..Please check!",
            );
        }
        else
        {
            let numPresent = false;

            this.state.usersList.map((user) => {
                if(user.mobileNum == this.state.mobileNum)
                {
                    numPresent = true;
                }
            });

            if(numPresent)
            {
                Alert.alert(
                    "",
                    "Phone number is already registered!",
                );
            }
            else{
                
                this.toggleModal();
            }

            
            
        }
    }

    submitRegistration = async () => {

        //const tk = await register();

        db.ref('/users').push({
            firstName : this.state.firstName,
            lastName : this.state.lastName,
            mobileNum : this.state.mobileNum,
            email : this.state.email,
            newPassword : this.state.newPassword,
            conPassword : this.state.conPassword,
            imageUrl : this.state.imageUrl,
        });

        this.props.navigation.navigate('Login');
                
    }
    
    uriToBlob = (uri) => {

    return new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();

        xhr.onload = function() {
        // return the blob
        resolve(xhr.response);
        };
        
        xhr.onerror = function() {
        // something went wrong
        reject(new Error('uriToBlob failed'));
        };

        // this helps us get a blob
        xhr.responseType = 'blob';

        xhr.open('GET', uri, true);
        xhr.send(null);

    });

    }
    
    uploadToFirebase = (blob) => {
    return new Promise((resolve, reject)=>{
        var name = this.state.mobileNum;              
        var uploadTask = imgDb.ref(`dp/${name}`).put(blob);
        uploadTask.on('state_changed',
            (snapshot)=>{
                resolve(snapshot);
            },
            (error)=>{
                console.log(error);
            },  
            ()=>{
                imgDb.ref('dp').child(name).getDownloadURL().then(url => {                    
                    this.setState({
                        imageUrl : url
                    });
                    this.submitRegistration();
                })
            });
        
    });
    }      

    getImageFromCamera = async () => {
        const cameraPermission = await Permissions.askAsync(Permissions.CAMERA);
        const cameraRollPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);


        if(cameraPermission.status === 'granted' && cameraRollPermission.status === 'granted')
        {
            let capturedImage = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4,5]
            });

            if(!capturedImage.cancelled)
            {
                this.processImage(capturedImage.uri);
                
            }
        }
    }

    getImageFromGallery = async () => {

        const cameraPermission = await Permissions.askAsync(Permissions.CAMERA);
        const cameraRollPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        
        if(cameraPermission.status === 'granted' && cameraRollPermission.status === 'granted')
        {
            let galleryImage = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4,5]
            })

            if(!galleryImage.cancelled)
            {
                this.processImage(galleryImage.uri);
                
            }
        }
    }

    processImage = async (imageUri) => {
        let processedImage = await ImageManipulator.manipulateAsync(
            imageUri,
            [
                {resize : {width : 400}}
            ],
            {format : 'png'}
        )
        this.setState({
            dpUri : imageUri
        })      
        
    }

    uploadImage = () => {
        Alert.alert(
            "",
            "Please wait while you're registering!",
        );
        
        this.uriToBlob(this.state.dpUri)
        .then((blob) => {
            return this.uploadToFirebase(blob);
        })
        .then((snapshot)=>{
            console.log("File uploaded");        
        }).catch((error)=>{    
        throw error;    
        }); 
    }

    toggleModal = () =>
    {
        this.setState({
            modalOpen : !this.state.modalOpen
        });
    }

    render()
    {
        return(
            <ScrollView>
                <View style={styles.loginContainer}>

                    <View style={{alignItems:'baseline', marginTop: 20, marginLeft: 14}}>
                        <Icon
                            style={{}}
                            name="arrow-back"
                            type="material"
                            color="white"
                            onPress={() => this.props.navigation.navigate('Login')}
                            size={35}
                        />
                    </View>

                    <View style={{alignItems:'baseline'}}>
                            <Text style={styles.appName}>Registration</Text>
                    </View>

                    <View style={{alignItems: 'center'}}>

                        <Input
                            placeholder="First Name"
                            inputStyle={{backgroundColor: 'white', paddingLeft: 15}}
                            containerStyle={{width: '90%'}}
                            value={this.state.firstName}
                            onChangeText={(firstName) => this.setState({firstName: firstName})}
                        />

                        <Input
                            placeholder="Last Name"
                            inputStyle={{backgroundColor: 'white', paddingLeft: 15}}
                            containerStyle={{width: '90%', marginTop: 15}}
                            value={this.state.lastName}
                            onChangeText={(lastName) => this.setState({lastName: lastName})}
                        />

                        <Input
                            placeholder="Mobile Number"
                            inputStyle={{backgroundColor: 'white', paddingLeft: 15}}
                            containerStyle={{width: '90%', marginTop: 15}}
                            value={this.state.mobileNum}
                            onChangeText={(mobileNum) => this.setState({mobileNum: mobileNum})}
                            keyboardType="number-pad"
                            maxLength={10}
                        />

                        <Input
                            placeholder="Email Id"
                            inputStyle={{backgroundColor: 'white', paddingLeft: 15}}
                            containerStyle={{width: '90%', marginTop: 15}}
                            value={this.state.email}
                            onChangeText={(email) => this.setState({email: email})}
                            textContentType="emailAddress"
                        />

                        <Input
                            placeholder="New Password"
                            inputStyle={{backgroundColor: 'white', paddingLeft: 15}}
                            containerStyle={{width: '90%', marginTop: 15}}
                            value={this.state.newPassword}
                            onChangeText={(newPassword) => this.setState({newPassword: newPassword})}
                            secureTextEntry={true}
                        />

                        <Input
                            placeholder="Confirm Password"
                            inputStyle={{backgroundColor: 'white', paddingLeft: 15}}
                            containerStyle={{width: '90%', marginTop: 15}}
                            value={this.state.conPassword}
                            onChangeText={(conPassword) => this.setState({conPassword: conPassword})}
                            secureTextEntry={true}
                        />

                        <View>
                            <Button
                                title="Next"
                                titleStyle={{color: 'black'}}
                                buttonStyle={{backgroundColor:'red', width: '100%', borderRadius: 15}}
                                onPress={this.validateUserData}
                            />
                        </View>

                    </View>                  

                </View>

                <Modal animationType="slide" visible={this.state.modalOpen} onRequestClose={this.toggleModal}>
                    <ScrollView >
                        
                        <View style={styles.loginContainer}>

                            <View style={{marginTop: 40, marginLeft: 20}}>
                                <Text style={{color: 'red', fontSize: 20}}>Setting up your account. . .</Text>
                            </View>

                            <View style={{alignItems:'center', marginTop: 100}}>

                                <Text style={{color: 'red', fontSize: 20}}>Add a profile picture</Text>

                                <Image
                                    source={{uri : this.state.dpUri}}
                                    style={styles.image}                               
                                />

                                <View style={{flexDirection: 'row'}}>
                                    <Text style={{color: 'white', fontSize: 20,marginRight: 30}}>Camera</Text>
                                    <Icon name="camera" type="font-awesome" color="red" size={30} onPress={this.getImageFromCamera}/>
                                </View>

                                <View style={{flexDirection: 'row', marginTop: 30}}>
                                    <Text style={{color: 'white', fontSize: 20,marginRight: 37}}>Gallery</Text>
                                    <Icon name="film" type="font-awesome" color="red" size={30} onPress={this.getImageFromGallery}/>
                                </View>

                                <View style={{position: 'absolute', top: 500, right: 0, marginRight: 10 }}>
                                    <Button
                                        icon={<Icon name="check" type="font-awesome" color="white"/>}
                                        buttonStyle={{backgroundColor: 'red', borderRadius: 100, height: 65, width: 65}}
                                        onPress={this.uploadImage}
                                        //() => {this.toggleModal();this.props.navigation.navigate('Dashboard')}
                                    />
                                </View> 

                            </View>

                        </View>

                    </ScrollView>

                </Modal>

            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    loginContainer:{
        height: Dimensions.get('window').height,
        backgroundColor: 'black'       
    },
    appName:{
        color: 'red',
        paddingTop: 20,
        fontSize: 27,
        marginLeft: 20,
        marginBottom: 50    
    },
    image:{
        margin: 30,
        width: 100,
        height: 100,
        borderRadius: 100
    }
})

export default Registration;