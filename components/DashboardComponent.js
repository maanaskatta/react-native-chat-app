import React, {Component, useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Alert, BackHandler, Image, YellowBox, TouchableHighlight, AsyncStorage} from 'react-native';
import {Icon, ListItem, Badge, Button} from 'react-native-elements';
import {Notifications} from 'expo';
import * as Permission from 'expo-permissions';
import {db} from '../src/config';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';




async function register()
{
    const {status} = await Permission.askAsync(Permission.NOTIFICATIONS);
    console.log(status);
    
    if(status !== 'granted')
    {
        alert("You have not enabled notification permission!");
        return;
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return status;

    
}




class Dashboard extends Component
{
    constructor(props)
    {
        super(props);
        YellowBox.ignoreWarnings(['Setting a timer']);

        this.state={
            chatModal: false,
            selectedChat : '',
            receiverNum : '',
            selectedChatDp : '',
            chats : [],
            userName : this.props.route.params.userName,
            userPhoneNumber : this.props.route.params.phoneNumber,
            message : '',
            friends: [], 
            searchModal: false,
            searchUserNumber : '',
            foundUser : null,
            settingModal : false,
            loggedIn : true ,
            dpImage : '', 
        }
    }


    sendMessage = () => {    
        
        var d = new Date();
        var date = d.toLocaleDateString();

        function formatAMPM(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }

        var time = formatAMPM(new Date());
        
        if(this.state.message.length != 0)
        {
            db.ref('/test').push({
                sender : this.state.userName,
                receiver : this.state.selectedChat,
                message : this.state.message,
                senderNum : this.state.userPhoneNumber,
                receiverNum: this.state.receiverNum,
                date : date,
                time : time
            });
    
            this.setState({
                message : ''
            });
        }
        else{
            return <></>;
        }
    }

    toggleSettingModal = () =>  {
        this.setState({
            settingModal : !this.state.settingModal
        })
    }

    removeItem = async () => {
        try{
            await AsyncStorage.removeItem('userDetails');
            return true;
        }
        catch(exception){
            console.log("Error has occured!");            
        }
    }


    logout = () => {
        Alert.alert(
            "",
            "Are you sure you want to Logout?",
            [
                {
                    text:"Cancel",
                    onPress: this.toggleSettingModal
                },
                {
                    text: "Logout",
                    onPress: () => {
                        this.removeItem().then(console.log("Item is removed!"));
                        this.setState({
                            selectedChat : '',
                            chats : [],
                            friends: [],
                            userName : '',
                        })
                        this.toggleSettingModal();
                        this.props.navigation.navigate('Login');
                    }
                    
                }
            ]

        )
    }

    listen = async () => {
        
        const perm = await register(); 
        //if(perm == 'granted')
        {
            if(this.state.friends[0].person != this.state.userName)
            {
                Notifications.presentLocalNotificationAsync({
                    title : this.state.friends[0].name,
                    body: this.state.friends[0].message,
                    android:{
                        sound: true,
                        vibrate : true,
                        color: '#512DA8',
        
                    },
                    ios:{
                        sound: true,
                    },               
                });
            }    
            
        }
    }

    fetchDataFromDB = () => {
        let userImages = [];

        db.ref('/users').on('value', querySnapShot => {
            let data = querySnapShot.val() ? querySnapShot.val() : {};
            let tempD = {...data};
            let tempData = Object.values(tempD);
            tempData.map((data) => {
                userImages.push({
                    mobileNum : data.mobileNum,
                    dp : data.imageUrl
                });
            })
            
        });      

        db.ref('/test').on('value', querySnapShot => {
            let data = querySnapShot.val() ? querySnapShot.val() : {};
            let chatData = {...data}; 
            
            let usersData = Object.values(chatData);


            const result = [];
            const map = new Map();

            for(let i = usersData.length -1 ; i >= 0 ; i--) {
                if(usersData[i].receiver === this.state.userName || usersData[i].sender === this.state.userName)
                {
                    if(!map.has(usersData[i].receiver) && usersData[i].sender === this.state.userName )
                    {
                        map.set(usersData[i].receiver, true);
                        result.push({
                            person : usersData[i].sender,
                            date : usersData[i].date,
                            time: usersData[i].time,
                            message: usersData[i].message,
                            name : usersData[i].receiver,
                            phoneNumber : usersData[i].receiverNum,
                            dpImage : userImages.filter((user) => {
                                if(user.mobileNum === usersData[i].receiverNum)
                                {
                                    return user.dp;
                                }
                            }) 
                        });
                    }
                    else if(!map.has(usersData[i].sender) && usersData[i].receiver === this.state.userName )
                    {
                        map.set(usersData[i].sender, true);
                        result.push({
                            person : usersData[i].sender,
                            date : usersData[i].date,
                            time: usersData[i].time,
                            message: usersData[i].message,
                            name : usersData[i].sender,
                            phoneNumber : usersData[i].senderNum,
                            dpImage : userImages.filter((user) => {
                                if(user.mobileNum === usersData[i].senderNum)
                                {
                                    return user.dp;
                                }
                            })
                        });
                    }
                }
            }          

            this.setState({
                friends : result
            });
        });
    }  

    componentDidMount()
    {      
        register();
        //Notifications.addListener(this.listen);
        BackHandler.addEventListener('hardwareBackPress', function(){
            BackHandler.exitApp();
        });
        this.fetchDataFromDB();

        
    }



    toggleChatModal = (name, receiverNum, selectedChatDp ) =>
    {
        this.setState({
            chatModal : !this.state.chatModal,
            selectedChat : name, 
            receiverNum : receiverNum ? receiverNum : this.state.receiverNum,
            selectedChatDp : selectedChatDp,
        });     
        
        db.ref('/test').on('value', querySnapShot => {
            let data = querySnapShot.val() ? querySnapShot.val() : {};
            let chatData = {...data};
            

            this.setState({
                chats : Object.values(chatData)
            });
        });
    }

    toggleSearchModal = () => {

        this.setState({
            searchModal : !this.state.searchModal
        })
    }

    searchUsers = () => {

        db.ref('/users').on('value', querySnapShot => {
            let data = querySnapShot.val() ? querySnapShot.val() : {};
            let usersData = {...data};

            const users = Object.values(usersData);

            users.map((user) => {
                if(user.mobileNum === this.state.searchUserNumber)
                {
                    this.setState({
                        foundUser : user
                    });
                    return true;
                }
            })

        });
    }

    showMessageDetails = (mess) => {
        Alert.alert(
            "",
            `Message : ${mess.message}\n\nTime : ${mess.time}\n\nDate : ${mess.date}\n\nStatus : Delivered`
            
        );
    }

    displayDefaultMessage = () => {
        Alert.alert(
            "",
            "Feature under development!"
        );
    }

    render()
    {
        
        const RenderChat = () => 
        {
            var chatMessages = this.state.chats;
            

            if(chatMessages.length == 0)
            {
                console.log("Empty");
                return <Text>Empty</Text>
            }
            else
            {
                return(
                    chatMessages.map((mess, index) => {
                        if(mess.sender === this.state.userName && mess.receiver === this.state.selectedChat || mess.sender === this.state.selectedChat && mess.receiver === this.state.userName )
                        {
                            if(mess.sender === this.state.userName)
                            {//<Text key={index} style={styles.receiverMessageStyle}>{mess.message}</Text>
                                return(
                                    <TouchableHighlight key={index} onLongPress={() => this.showMessageDetails(mess)}>
                                        <View key={index} style={styles.receiverMessageStyle}>
                                            <Text style={{color: 'white', fontSize: 15}}>{mess.message}</Text>
                                            <Text style={{alignSelf: 'flex-end', color:'black', fontSize:13, marginLeft: 25}}>{mess.time}</Text>
                                        </View> 
                                    </TouchableHighlight>
                                );
                            }
                            else if(mess.sender != this.state.userName){
                                //<Text key={index} style={styles.senderMessageStyle}>{mess.message}</Text>
                                return(
                                    <TouchableHighlight key={index} onLongPress={() => alert("Message details!")}>
                                        <View key={index} style={styles.senderMessageStyle}>
                                            <Text style={{color: 'black', fontSize: 15}}>{mess.message}</Text>
                                            <Text style={{alignSelf: 'flex-end', color:'black', fontSize:13, marginLeft: 25}}>{mess.time}</Text>
                                        </View>
                                    </TouchableHighlight>
                                    
                                );
                            }
                        }
                    })
                );
            }
        }

        const RenderFoundUser = () => {
            if(this.state.foundUser != null)
            {
                return(
                    <>
                        <Text style={{color:'white', fontSize: 20, marginBottom: 20}}>Found a <Text style={{color : 'red', fontStyle:'italic'}}>user</Text> !..</Text>
                        <ListItem
                            title={this.state.foundUser.firstName + " " + this.state.foundUser.lastName}
                            titleStyle={{color: 'black', fontSize: 18}}
                            leftAvatar={{source:{uri : this.state.foundUser.imageUrl}}}
                            rightElement={<Icon name="comments" type="font-awesome" size={30}/>}
                            containerStyle={{backgroundColor: 'red', borderRadius : 25}}
                            onPress={() => {this.toggleSearchModal();this.toggleChatModal(this.state.foundUser.firstName + " " + this.state.foundUser.lastName, this.state.foundUser.mobileNum, this.state.foundUser.imageUrl)}}
    
                        />
                    </>
                );
            }
            else {
                return(
                    <Text style={{color:'white', fontSize: 20, marginLeft: 65, fontStyle:'italic'}}>No contacts found!...</Text>
                );
            }
            
            
            
        }

        return(
            <View>
                <View>

                    <View style={styles.header}>
                        <Text style={{fontSize: 26, margin: 14, fontWeight: 'bold'}}>LapTalk</Text>

                        <TextInput
                            placeholder="Search in chats..."
                            style={{backgroundColor: 'white', width: '50%', marginTop: 14, borderRadius: 10, paddingLeft: 10, fontSize: 18, padding: 5}}
                        />

                        <Modal transparent={true} visible={this.state.settingModal} animationType="slide" onRequestClose={this.toggleSettingModal}>
                            
                            <View style={{flex: 1,flexDirection: 'column'}}>
                            
                                <View style={{backgroundColor:'whitesmoke', position:"absolute", top: 7, right:10, width : 200}}>

                                    <ListItem
                                        title ="Account"
                                        bottomDivider
                                        onPress={this.displayDefaultMessage}

                                    />
                                    <ListItem
                                        title= "Data Storage"
                                        bottomDivider
                                        onPress={this.displayDefaultMessage}
                                        
                                    />
                                    <ListItem
                                        title= "Security"
                                        bottomDivider
                                        onPress={this.displayDefaultMessage}
                                        
                                    />
                                    <ListItem
                                        title= "Logout"
                                        bottomDivider
                                        onPress={this.logout}
                                    />
                                    
                                    
                                    
                                </View>
                            </View>
                        </Modal>

                        <Icon
                            name="gear"
                            type="font-awesome"
                            color="black"
                            size={30} 
                            onPress={this.toggleSettingModal}   
                            iconStyle={{margin: 17}}             
                            
                        />
                    </View>

                    <View>
                        <View style={{position:'absolute', top: 600, zIndex: 7, left: 280}}>
                            <Button
                                icon={<Icon name="search" type="font-awesome" color="white" size={25}/>}
                                buttonStyle={{backgroundColor: 'red', height: 60, width: 60, borderRadius: 500}}
                                onPress={this.toggleSearchModal}
                            />
                        </View>
                        
                        <ScrollView style={styles.chatContainer}>
                            {
                                this.state.friends.length > 0 ? 

                                this.state.friends.map((chat, index) => {
                                    return(
                                        <ListItem
                                            key={index}
                                            title={chat.name}
                                            titleStyle={{color: 'white'}}
                                            subtitle={chat.message}
                                            subtitleStyle={{color: 'gray', maxHeight: 20}}
                                            leftAvatar={{source: {uri : chat.dpImage[0].dp}}}
                                            bottomDivider
                                            rightSubtitle={<Text style={{color: 'gray'}}>{chat.time}</Text>}
                                            containerStyle={{backgroundColor: 'black'}}
                                            onPress={()=>this.toggleChatModal(chat.name, chat.phoneNumber, chat.dpImage[0].dp)}
                                            
                                        />
                                    );
                                }) 
                                : <View style={{marginTop : 80}}>
                                    <Text style={{color : 'whitesmoke', fontSize : 25, textAlign : 'center', letterSpacing : 1}}>Welcome to <Text style={{color : 'red', letterSpacing : 0, fontWeight : 'bold', fontStyle:'italic'}}>LAP/TALK</Text></Text>
                                    <Text style={{color : 'grey', textAlign : 'center', marginTop : 50, fontSize : 18}}>Search for your friends : </Text>
                                    <Text style={{color : 'grey', textAlign : 'center', marginTop : 10, fontSize : 18}}>Click the <Text style={{color : 'red', fontStyle:'italic'}}>Search Button</Text> below</Text>
                                    
                                </View>
                            }
                        </ScrollView>
                    </View>

                    
                </View>


                <Modal animationType="slide" visible={this.state.chatModal} onRequestClose={this.toggleChatModal}>

                    <View style={{flex: 1, backgroundColor: 'black'}}>

                        <View style={styles.chatHeader}>
                            <Icon
                                name="arrow-back"
                                type="material"
                                color="white"
                                size={30}
                                iconStyle={{marginLeft: 5, marginTop: 10, padding: 10}}
                                onPress={this.toggleChatModal}
                            />

                            <Image
                                source={{uri : this.state.selectedChatDp}}
                                style={{height: 50, width: 50, borderRadius: 500, marginTop: 11, marginRight: 5}}
                            />      

                            <Text style={{color: 'white', fontSize: 19, marginTop: 22}}>{this.state.selectedChat}</Text>

                            <View style={{position: 'absolute', right: 20, top: 14}}>
                                <Icon
                                    name="ellipsis-v"
                                    type="font-awesome"
                                    color="white"
                                    size={25}
                                    iconStyle={{padding: 10}}                                    
                                    onPress={this.displayDefaultMessage}
                                /> 
                            </View>

                        </View>

                        <KeyboardAvoidingView style={styles.chatBody}>
                            
                            <View style={styles.chatArea}>

                                <ScrollView ref={ref => {this.scrollView = ref}} onContentSizeChange={() => {this.scrollView.scrollToEnd({animated: true});}}>   
                                    <RenderChat/>                                                                            
                                </ScrollView>                                                          

                            </View>

                            <View style={styles.typeArea}>

                                <View style={{flex: 5}}>
                                    <TextInput
                                        placeholder="Type a message. . ."
                                        style={styles.textInput}
                                        value={this.state.message}
                                        onChangeText={(message) => this.setState({message : message})}
                                    />
                                </View>

                                <View style={{flex: 1}}>

                                    <Icon
                                        name="send"
                                        type="material"
                                        color="red"
                                        size={30}
                                        iconStyle={{backgroundColor: 'black', padding:10, borderRadius: 100, marginTop: 10}}
                                        onPress={this.sendMessage}
                                    />

                                </View>                              
                
                            </View>

                            
                            
                            
                        </KeyboardAvoidingView> 

                    </View>
                </Modal>

                <Modal animationType="slide" visible={this.state.searchModal} onRequestClose={this.toggleSearchModal} >

                    <View style={{flex: 1, backgroundColor: 'black'}}>

                        <View style={styles.chatHeader}>
                            <Icon
                                name="arrow-back"
                                type="material"
                                color="white"
                                size={30}
                                iconStyle={{marginLeft: 5, marginTop: 10, padding: 10}}
                                onPress={this.toggleSearchModal}
                            />

                            

                            <Text style={{color: 'white', fontSize: 19, marginTop: 22}}>Search for Contacts</Text>

                        </View>

                        <View style={{display:'flex', flexDirection:'row', marginTop: 150, marginLeft: 10, marginRight: 10}}>

                            
                            <View style={{flex:3, marginRight: 10}}>
                                <TextInput
                                    placeholder="Phone number. . ."
                                    style={{backgroundColor: 'white', width: '100%', padding:10, borderRadius: 15, paddingLeft: 20, fontSize: 20}}
                                    maxLength={10}
                                    keyboardType="phone-pad"
                                    onChangeText={(searchUserNumber) => this.setState({searchUserNumber: searchUserNumber})}
                                    value={this.state.searchUserNumber}
                                />
                            </View>

                            <View style={{flex:1, marginTop: 3}}>
                                <Button
                                    title="Search"
                                    buttonStyle={{borderRadius: 15, backgroundColor: 'red'}}
                                    onPress={this.searchUsers}
                                    
                                />
                            </View>                           

                        </View>

                        <View style={{marginLeft: 10, marginRight: 10, marginTop: 80}}>
                            <RenderFoundUser/>
                        </View>

                    </View>

                </Modal>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    header:{
        flexWrap: "wrap",
        backgroundColor: 'red',
        height: 70
    },
    chatContainer:{
        height: 700,
        backgroundColor: 'black',
        
    },
    chatHeader:{
        height: 70,
        backgroundColor: 'red',
        flexWrap:'wrap'
    },
    chatBody:{       
        flex:1, 
        flexDirection:'column'   
    },
    chatArea:{
        flex: 9,
        backgroundColor: 'black'
    },
    typeArea:{
        flex: 1,
        backgroundColor: 'black',
        flexDirection: 'row',
        marginBottom: 18          
    },
    textInput:{
        backgroundColor: 'white',
        paddingLeft: 15,
        marginTop: 15,
        marginLeft: 15,
        borderRadius: 10,
        height: 40,
        fontSize: 18,
    },
    sendButton:{
        marginTop: 10,
        backgroundColor: 'white',
        height: 50,
        width: 50,
        borderRadius: 500
    },

    senderMessageStyle:{
        alignSelf:'baseline',
        marginLeft: 15,
        marginTop: 5,
        backgroundColor: 'white',
        maxWidth: "80%",
        padding: 5,
        borderRadius: 10
    },

    receiverMessageStyle:{
        alignSelf:'flex-end',
        marginRight: 15,
        marginTop: 5,
        backgroundColor: 'red',
        maxWidth: "80%",
        padding: 5,
        borderRadius: 10
    }
    
})

export default Dashboard;

