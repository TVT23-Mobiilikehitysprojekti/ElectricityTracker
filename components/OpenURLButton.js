import { Button } from '@rneui/base';
import React, {useCallback, useState, useEffect} from 'react';
import {Alert, Linking, Text, Pressable, StyleSheet, Dimensions, Image, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

const screenDimensions = Dimensions.get('screen')
export default function OpenURLButton({url, userId, children}) {
    const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0 });
    const [userVote, setUserVote] = useState(null);

    const handlePress = useCallback(async () => {
      // Checking if the link is supported for links with custom URL scheme.
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        // Opening the link with some app, if the URL scheme is "http" the web link should be opened
        // by some browser in the mobile
        await Linking.openURL(url);
      } else {
        Alert.alert(`Don't know how to open this URL: ${url}`);
      }
    }, [url])

    const fetchVotes = async () => {
      try {
        const response = await axios.get('https://electricitytracker-backend.onrender.com/vote/votes', {params: { itemId: url}});
        setVotes(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    const fetchUserVote = async () => {
      try {
        const response = await axios.get('https://electricitytracker-backend.onrender.com/vote/user-votes', { params: { userId: userId, itemId: url } });
        setUserVote(response.data.vote_type);
      } catch (error) {
        console.error(error);
      }
    }
  
    const handleVote = async (voteType) => {
      try {
        if (voteType === 'upvote'){
        await axios.post('https://electricitytracker-backend.onrender.com/vote/upvote', {
          userId: userId,
          itemId: url,
        });
        } else if (voteType === 'downvote'){
          await axios.post('https://electricitytracker-backend.onrender.com/vote/upvote', {
            userId: userId,
            itemId: url,
          });
        }
        fetchVotes();
        fetchUserVote();
      } catch (error) {
        console.error(error);
      }
    }

    const [primaryText, secondaryText] = React.Children.toArray(children);
    
    useEffect(() => {
      fetchVotes();
      fetchUserVote();
    }, [])

    return (
      <Pressable style={styles.button} onPress={handlePress}>
      <View style={styles.textContainer}>
        <Text style={styles.primary}>{primaryText}</Text>
        {secondaryText && <Text style={styles.secondary}>{secondaryText}</Text>}
      </View>
      <View style={styles.voteContainer}>
        <TouchableOpacity 
          style={''} 
          onPress={handleVote('upvote')}
          disabled={userVote === 'upvote'}>
          <Image 
            source={require('../assets/up-arrow.png')}
            style={styles.image}></Image>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleVote('downvote')}
          disabled={userVote === 'downvote'}>
          <Image 
            source={require('../assets/down-arrow.png')}
            style={styles.image}></Image>
        </TouchableOpacity>
      </View>
      <View>
        <Text>{votes}</Text>
      </View>
      </Pressable>
    )
  };

const styles = StyleSheet.create({
    button: {       
        width: screenDimensions.width-32,  
        backgroundColor: '#f9c2ff',
        padding: 40,
        marginVertical: 15,
        marginHorizontal: 0,
        flexDirection: 'row',
    },
    primary: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    secondary: {
        fontStyle: 'italic',
        fontWeight: '300',
    },
    image: {
        width: 50,
        height: 50,
        resizeMode: 'cover',
    },
    voteContainer: {
        flexDirection: 'column',
        gap: 10,
    },
    textContainer: {
        flexDirection: 'column',
    },

})