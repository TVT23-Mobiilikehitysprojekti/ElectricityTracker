import { Button } from '@rneui/base';
import React, {useCallback} from 'react';
import {Alert, Linking, Text, Pressable, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';

const screenDimensions = Dimensions.get('screen')
export default function OpenURLButton({url, children}) {
    
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
    const [primaryText, secondaryText] = React.Children.toArray(children);
    const handleUpVote = () => {
      
    }
    return (
      <Pressable style={styles.button} onPress={handlePress}>
      <Text style={styles.primary}>{primaryText}</Text>
      {secondaryText && <Text style={styles.secondary}>{secondaryText}</Text>}
      <TouchableOpacity style={''} onPress={handleUpVote}>
        <Image source={require('../assets/up-arrow.png')}></Image>
      </TouchableOpacity>
      <TouchableOpacity>
        <Image source={require('../assets/down-arrow.png')}></Image>
      </TouchableOpacity>
      </Pressable>
    )
  };

const styles = StyleSheet.create({
    button: {       
        width: screenDimensions.width-32,  
        backgroundColor: '#f9c2ff',
        padding: 40,
        marginVertical: 15,
        marginHorizontal: 0
    },
    primary: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    secondary: {
        fontStyle: 'italic',
        fontWeight: '300',
    },

})