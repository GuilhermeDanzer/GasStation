import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Button,
} from 'react-native'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../../App'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

type GasStationDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'GasStationDetails'
>
type GasStationDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GasStationDetails'
>

type Props = {
  route: GasStationDetailScreenRouteProp
  navigation: GasStationDetailScreenNavigationProp
}

const GasStationDetails: React.FC<Props> = ({ route, navigation }) => {
  const { gasStation } = route.params
  console.log(gasStation)
  const handleUpdatePrice = () => {
    navigation.navigate('EditGasStation', { gasStationId: gasStation.id })
  }
  const openMaps = () => {
    const daddr = `${gasStation.name} ${gasStation.address} ${gasStation.state} ${gasStation.city}`
    const company = Platform.OS === 'ios' ? 'apple' : 'google'
    Linking.openURL(`http://maps.${company}.com/maps?daddr=${daddr}`)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{gasStation.name}</Text>
      <Text>{gasStation.address}</Text>
      <Text>
        {gasStation.city}, {gasStation.state}
      </Text>
      {gasStation.price && gasStation.price.length > 0 ? (
        <View>
          <Text style={styles.subTitle}>Preços:</Text>
          {gasStation.price.map((currentPrice: PriceType) => (
            <View key={currentPrice.id} style={styles.priceRow}>
              <Text>
                {currentPrice.name}: R${' '}
                {currentPrice.price?.toString().replace('.', ',')}
              </Text>
            </View>
          ))}

          <Text style={styles.outdatedText}>
            Preço desatualizado?
            <Text style={styles.updateLink} onPress={handleUpdatePrice}>
              Sinta-se livre para atualizar
            </Text>
          </Text>
        </View>
      ) : (
        <View>
          <Text>
            Sem informações sobre o preço?
            <Text style={styles.updateLink} onPress={handleUpdatePrice}>
              Seja o primeiro a adicionar
            </Text>
          </Text>
        </View>
      )}
      <Button title="Me leve ate o posto" onPress={openMaps} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 18,
    marginTop: 10,
  },
  priceRow: {
    marginTop: 10,
  },
  outdatedText: {
    fontSize: 12,
    color: 'gray',
  },
  updateLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
})

export default GasStationDetails
