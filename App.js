
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import NewsScreen from './screens/NewsScreen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <NewsScreen/>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
