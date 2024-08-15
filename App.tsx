import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Location from 'expo-location'
import Home from './src/screen/Home'
import RegisterGasStation from './src/screen/RegisterGasStation'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import GasStationDetails from './src/screen/GasStationDetails'
import EditGasStation from './src/screen/EditGasStation'
import { DefaultTheme, DarkTheme } from '@react-navigation/native'

export type RootStackParamList = {
  Home: undefined
  RegisterGasStation: undefined
  GasStationDetails: { gasStation: GasStationType }
  EditGasStation: { gasStationId: number }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function App() {
  const MyTheme: Theme = {
    dark: true,
    colors: {
      primary: 'rgb(10, 132, 255)',
      background: '#d0d0d0',
      card: 'rgb(18, 18, 18)',
      text: 'rgb(229, 229, 231)',
      border: 'rgb(39, 39, 41)',
      notification: 'rgb(255, 69, 58)',
    },
  }
  useEffect(() => {
    ;(async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      console.log(location)
    })()
  }, [])
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen
            name="RegisterGasStation"
            component={RegisterGasStation}
          />
          <Stack.Screen
            name="GasStationDetails"
            component={GasStationDetails}
          />
          <Stack.Screen name="EditGasStation" component={EditGasStation} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
