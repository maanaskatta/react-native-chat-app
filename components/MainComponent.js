import React, {Component} from 'react';
import {AsyncStorage, YellowBox, Text} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './LoginComponent';
import Registration from './RegistrationComponent';
import Dashboard from './DashboardComponent';

const Stack = createStackNavigator();

class Main extends Component
{
    constructor(props)
    {
        super(props);
        this.prepareLogin();
        YellowBox.ignoreWarnings(['Setting a timer']);

        this.state = {
            loading : true,
            userDetails : ''
        }
    }

    _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('userDetails');
            if (value != null) {
                return value;            
            }
        } catch (error) {
            console.log("Cannot find the data");
        }
    };

    prepareLogin = () =>
    {
        this._retrieveData()
        .then((data) => {
            if(data != null)
            {
                this.setState({
                    loggedIn : true,
                    loading: false,
                    userDetails : JSON.parse(data)
                })
            }
            else
            {
                this.setState({
                    loggedIn : true,
                    loading: false,
                })
            }
        });
    }

    render()
    {
        if(!this.state.loading) // Do not change! (Has to be !)
        {          
            return(
        
                <NavigationContainer>
                    <Stack.Navigator>
                        {!this.state.userDetails.loggedIn ? (
                            <>
                                <Stack.Screen name="Login" component={Login}
                                    options={{
                                        title: " ",
                                        headerStyle:{
                                            backgroundColor: 'red',
                                            height: 34,
                                        },
                                        headerLeft : null
                                    }}
                                />
    
                                <Stack.Screen name="Registration" component={Registration}
                                    options={{
                                        title: ' ',
                                        headerStyle:{
                                            backgroundColor: 'red',
                                            height: 34,
                                        },
                                        headerLeft: null
                                    }}
                                />   

                                <Stack.Screen name="Dashboard" component={Dashboard}
                                    options={{
                                        title: ' ',
                                        headerStyle:{
                                            backgroundColor: 'red',
                                            height: 34,
                                        },
                                        headerLeft: null,                          
                                        
                                    }}
                                    initialParams={{userName : this.state.userDetails.name, phoneNumber : this.state.userDetails.phnNumber}}
                                />
                            </>
                        ) : 
                        (
                            
                            <>
                                <Stack.Screen name="Dashboard" component={Dashboard}
                                    options={{
                                        title: ' ',
                                        headerStyle:{
                                            backgroundColor: 'red',
                                            height: 34,
                                        },
                                        headerLeft: null,                          
                                        
                                    }}
                                    initialParams={{userName : this.state.userDetails.name, phoneNumber : this.state.userDetails.phnNumber}}
                                />

                                <Stack.Screen name="Login" component={Login}
                                        options={{
                                            title: " ",
                                            headerStyle:{
                                                backgroundColor: 'red',
                                                height: 34,
                                            }
                                    }}
                                />
                                
                                <Stack.Screen name="Registration" component={Registration}
                                    options={{
                                        title: ' ',
                                        headerStyle:{
                                            backgroundColor: 'red',
                                            height: 34,
                                        },
                                        headerLeft: null
                                    }}
                                /> 
                            </>
                        )}  
                    </Stack.Navigator>
                </NavigationContainer>           
            );            
        }
        else{
            return(
                <Text>Loading</Text>
            );
        }
    }
}

export default Main;