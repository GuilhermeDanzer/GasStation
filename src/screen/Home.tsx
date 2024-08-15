import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../App'
import { RouteProp, useFocusEffect } from '@react-navigation/native'
import Picker from 'react-native-picker-select'
import states from '../states.json'
import axios from 'axios'
import GasStationItem from '../components/GasStationItem'

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>
type Props = {
  navigation: HomeScreenNavigationProp
  route: HomeScreenRouteProp
}

const Home: React.FC<Props> = ({ navigation }) => {
  const [gasStations, setGasStations] = useState<GasStationType[]>([])
  const [state, setState] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [cities, setCities] = useState<{ label: string; value: string }[]>([])
  const [myReactions, setMyReactions] = useState<UserReaction[]>([])

  useFocusEffect(
    useCallback(() => {
      readGasStations()
      getMyReactions()
    }, [state])
  )

  useEffect(() => {
    if (state) {
      fetchCities(state)
    } else {
      setCities([])
    }
  }, [state])

  const readGasStations = async () => {
    try {
      const fetchData = await axios.get<GasStationType[]>(
        'https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/stations'
      )
      const { data } = fetchData

      // Sort by name
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name))

      setGasStations(sortedData)
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  const fetchCities = async (state: string) => {
    try {
      const response = await axios.get<Municipio[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`
      )
      const citiesData = response.data
      const formattedCities = citiesData.map(city => ({
        label: city.nome,
        value: city.nome,
      }))
      setCities(formattedCities)
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const getMyReactions = async () => {
    try {
      const response = await axios.get<UserReaction[]>(
        'https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/user_reactions/my_reactions/1'
      )
      setMyReactions(response.data)
    } catch (error) {
      console.error('Error fetching reactions:', error)
    }
  }
  const fetchStationById = async (stationId: number) => {
    try {
      const response = await axios.get<GasStationType>(
        `https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/stations/${stationId}`
      )
      return response.data
    } catch (error) {
      console.error('Error fetching station details:', error)
      return null
    }
  }

  const updateGasStation = (updatedStation: GasStationType) => {
    setGasStations(prevStations =>
      prevStations.map(station =>
        station.id === updatedStation.id ? updatedStation : station
      )
    )
  }

  const handleLike = async (stationId: number) => {
    // Optimistic UI update
    setMyReactions(prevReactions => {
      const existingReaction = prevReactions.find(
        reaction =>
          reaction.station_id === stationId && reaction.reaction === 'like'
      )
      const newReactions = [...prevReactions]
      if (existingReaction) {
        return newReactions.filter(
          reaction => reaction.id !== existingReaction.id
        )
      } else {
        // Remove dislike if exists
        const dislikeReaction = newReactions.find(
          reaction =>
            reaction.station_id === stationId && reaction.reaction === 'dislike'
        )
        if (dislikeReaction) {
          newReactions.splice(newReactions.indexOf(dislikeReaction), 1)
        }
        // Add like
        newReactions.push({
          id: Math.random(), // or use an existing ID if available
          station_id: stationId,
          user_id: 1,
          reaction: 'like',
          created_at: '',
          updated_at: '',
        })

        return newReactions
      }
    })

    try {
      const existingReaction = myReactions.find(
        reaction =>
          reaction.station_id === stationId && reaction.reaction === 'like'
      )

      if (existingReaction) {
        await axios.delete(
          `https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/user_reactions/${existingReaction.id}`
        )
      } else {
        const dislikeReaction = myReactions.find(
          reaction =>
            reaction.station_id === stationId && reaction.reaction === 'dislike'
        )
        if (dislikeReaction) {
          await axios.delete(
            `https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/user_reactions/${dislikeReaction.id}`
          )
        }

        await axios.post(
          'https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/user_reactions',
          {
            station_id: stationId,
            user_id: 1,
            reaction: 'like',
          }
        )
      }

      // Fetch the updated station details and update state
      const updatedStation = await fetchStationById(stationId)
      if (updatedStation) {
        updateGasStation(updatedStation)
      }

      // Refresh reactions
      getMyReactions()
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  const handleDislike = async (stationId: number) => {
    // Optimistic UI update
    setMyReactions(prevReactions => {
      const existingReaction = prevReactions.find(
        reaction =>
          reaction.station_id === stationId && reaction.reaction === 'dislike'
      )
      const newReactions = [...prevReactions]
      if (existingReaction) {
        return newReactions.filter(
          reaction => reaction.id !== existingReaction.id
        )
      } else {
        // Remove like if exists
        const likeReaction = newReactions.find(
          reaction =>
            reaction.station_id === stationId && reaction.reaction === 'like'
        )
        if (likeReaction) {
          newReactions.splice(newReactions.indexOf(likeReaction), 1)
        }
        // Add dislike
        newReactions.push({
          id: Math.random(), // or use an existing ID if available
          station_id: stationId,
          user_id: 1,
          reaction: 'dislike',
          created_at: '',
          updated_at: '',
        })

        return newReactions
      }
    })

    try {
      const existingReaction = myReactions.find(
        reaction =>
          reaction.station_id === stationId && reaction.reaction === 'dislike'
      )

      if (existingReaction) {
        await axios.delete(
          `https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/user_reactions/${existingReaction.id}`
        )
      } else {
        const likeReaction = myReactions.find(
          reaction =>
            reaction.station_id === stationId && reaction.reaction === 'like'
        )
        if (likeReaction) {
          await axios.delete(
            `https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/user_reactions/${likeReaction.id}`
          )
        }

        await axios.post(
          'https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/user_reactions',
          {
            station_id: stationId,
            user_id: 1,
            reaction: 'dislike',
          }
        )
      }

      // Fetch the updated station details and update state
      const updatedStation = await fetchStationById(stationId)
      if (updatedStation) {
        updateGasStation(updatedStation)
      }

      // Refresh reactions
      getMyReactions()
    } catch (error) {
      console.error('Error handling dislike:', error)
    }
  }

  const filteredGasStations = gasStations.filter(
    station =>
      (state ? station.state === state : true) &&
      (city ? station.city === city : true)
  )

  const isLiked = (stationId: number) =>
    myReactions.some(
      reaction =>
        reaction.station_id === stationId && reaction.reaction === 'like'
    )

  const isDisliked = (stationId: number) =>
    myReactions.some(
      reaction =>
        reaction.station_id === stationId && reaction.reaction === 'dislike'
    )

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          padding: 20,
          alignItems: 'center',
        }}>
        <View style={{ gap: 5 }}>
          <Text>Estado: </Text>
          <Picker
            style={{
              viewContainer: {
                borderWidth: 1,
                padding: Platform.OS === 'ios' ? 10 : 0,
                borderRadius: 5,
                width: Platform.OS === 'android' ? 150 : 100,
              },
            }}
            onValueChange={item => setState(item)}
            items={states}
          />
        </View>
        <View style={{ gap: 5 }}>
          <Text>Cidade: </Text>
          <Picker
            style={{
              viewContainer: {
                borderWidth: 1,
                padding: Platform.OS === 'ios' ? 10 : 0,
                borderRadius: 5,
                width: Platform.OS === 'android' ? 150 : 100,
              },
            }}
            onValueChange={item => setCity(item)}
            items={cities}
            disabled={state === ''}
          />
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('RegisterGasStation')}>
          <AntDesign name="pluscircle" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {filteredGasStations.length > 0 ? (
        <FlatList
          data={filteredGasStations}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <GasStationItem
              item={item}
              isLiked={isLiked}
              isDisliked={isDisliked}
              handleLike={handleLike}
              handleDislike={handleDislike}
              navigation={navigation}
            />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Não existe nenhum posto registrado para essa cidade ainda! Seja o
            primeiro a adicionar
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 16,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  picker: {
    height: 40,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 10,
  },
  pickerAndroid: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
})

export default Home
