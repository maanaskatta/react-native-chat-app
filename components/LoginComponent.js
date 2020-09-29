import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions, AsyncStorage, YellowBox, Alert} from 'react-native';
import {Input,Button, Icon} from 'react-native-elements';

import {db} from '../src/config';

class Login extends Component
{
    constructor(props)
    {
        super(props);
        YellowBox.ignoreWarnings(['Setting a timer']);
        this.state={
            phoneNumber : '',
            password : '',
            usersList : []
        }
    }

    componentDidMount()
    {
        db.ref('/users').on('value', querySnapShot => {
            let data = querySnapShot.val() ? querySnapShot.val() : {};
            let userAuthData = {...data};
            

            this.setState({
                usersList : Object.values(userAuthData)
            });

        });
    }


    checkUserAuthentication = () => {
        let userPresent = false;

        this.state.usersList.map((user) => {
            if(this.state.phoneNumber === user.mobileNum && this.state.password === user.newPassword)
            {
                this.props.navigation.navigate('Dashboard',{userName : user.firstName + " " +user.lastName, phoneNumber : user.mobileNum});
                this._storeData(user.firstName + " " +user.lastName, user.mobileNum );
                userPresent = true;
            }          
        });
        if(!userPresent)
        {
            Alert.alert(
                "",
                "Login credentials are invalid!",
                [
                    {
                        text : "Ok"
                    }
                ]
    
            )
        }
    }

    _storeData = async (name, phnNumber) => {
        const userDet = {
            name : name,
            phnNumber : phnNumber,
            loggedIn : true
        };

        try {
            await AsyncStorage.setItem(
            'userDetails', JSON.stringify(userDet))
            .then(console.log("Saved!"));

        } catch (error) {
            console.log("Error saving data");
        }
    };

    _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('userDetails');
            if (value !== null) {
            // We have data!!
            console.log(value);
            }
            else{
                console.log("Empty");
            }
        } catch (error) {
            // Error retrieving data
            console.log("Cannot find the data");
        }
    };

    render()
    {
        return(
            <ScrollView>
                <View style={styles.loginContainer}>

                    <View style={{alignItems:'center'}}>
                            <Text style={styles.appName}>LAP/TALK</Text>
                    </View>

                    <View style={styles.loginBody}>

                        <View style={{alignItems: 'center',margin: 30}}>
                            <Text style={{fontSize: 28, fontWeight : 'bold'}}>Log In</Text>
                        </View>                    
                        
                        <Input
                            placeholder="Phone number"   
                            keyboardType="number-pad"
                            inputContainerStyle={{backgroundColor:'white'}}
                            containerStyle={{marginLeft: 20, width: '90%'}}
                            leftIcon={<Icon style={{margin: 10}} name="phone" type="font-awesome" color="black" />}
                            value={this.state.phoneNumber}
                            onChangeText={(phoneNumber) => this.setState({phoneNumber : phoneNumber})}
                            
                        />

                        <Input
                            placeholder="Password"
                            inputContainerStyle={{backgroundColor:'white'}}
                            containerStyle={{marginLeft: 20, width: '90%'}}
                            leftIcon={<Icon style={{margin: 10}} name="lock" type="font-awesome" color="black" />} 
                            secureTextEntry={true}
                            value={this.state.password}
                            onChangeText={(password) => this.setState({password : password})}                       
                        />

                        <Button
                            title="Log In"
                            titleStyle={{color: 'red'}}
                            buttonStyle={{backgroundColor: 'black', width: '80%', marginLeft: 37}}
                            icon={<Icon style={{marginRight: 5}} name="sign-in" type="font-awesome" color="red" />}
                            onPress={this.checkUserAuthentication}
                            
                        />                   
                        

                    </View>  
                    <View style={{position: 'relative', top: 50}}>
                        
                        <Button
                            title="Sign In"
                            titleStyle={{color: 'red'}}
                            buttonStyle={{backgroundColor: 'black', width: '80%', marginLeft: 37}}
                            icon={<Icon style={{marginRight: 8}} name="user-plus" type="font-awesome" color="red" />} 
                            onPress={() => this.props.navigation.navigate('Registration')}                       
                        />  
                        

                    </View>    

                </View>

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
        paddingTop: 100,
        fontSize: 37,
        fontWeight: 'bold',
        letterSpacing: 5       
    },
    loginBody:{
        position: 'relative',
        top: 40,
        margin: 20,
        height: 300,
        backgroundColor: 'red',
        borderRadius: 20,
    },
    
    
})

export default Login;
//() => this.props.navigation.navigate('Registration')