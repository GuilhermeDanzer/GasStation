import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
} from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import axios from 'axios'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { RootStackParamList } from '../../App'

type EditGasStationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditGasStation'
>

type EditGasStationScreenRouteProp = RouteProp<
  RootStackParamList,
  'EditGasStation'
>

type EditGasStationProps = {
  navigation: EditGasStationScreenNavigationProp
  route: EditGasStationScreenRouteProp
}

const EditGasStation: React.FC<EditGasStationProps> = ({
  navigation,
  route,
}) => {
  const { gasStationId } = route.params
  const [gasStation, setGasStation] = useState<GasStationType | null>(null)
  const [prices, setPrices] = useState<PriceType[]>([])
  const [originalPrices, setOriginalPrices] = useState<PriceType[]>([]) // Save the original prices

  const fetchGasStationData = async () => {
    try {
      const fetchData = await axios.get(
        `https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/stations/${gasStationId}`
      )
      const data = fetchData.data as GasStationType
      setGasStation(data)

      const mappedPrices = data.price.map((price: any) => ({
        id: price.id,
        label: price.name,
        value: price.price.toString(),
        isEditing: false,
      }))

      setPrices(mappedPrices)
      setOriginalPrices(mappedPrices) // Save the original prices
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  useEffect(() => {
    fetchGasStationData()
  }, [gasStationId])

  const addPriceField = () => {
    const newId = prices.length > 0 ? prices[prices.length - 1].id + 1 : 1
    setPrices([...prices, { id: newId, label: '', value: '', isEditing: true }])
  }

  const updatePriceField = (id: number, key: string, value: string) => {
    setPrices(prevPrices =>
      prevPrices.map(price =>
        price.id === id ? { ...price, [key]: value } : price
      )
    )
  }

  const toggleEditing = (id: number) => {
    setPrices(prevPrices =>
      prevPrices.map(price =>
        price.id === id ? { ...price, isEditing: !price.isEditing } : price
      )
    )
  }

  const deletePriceField = (id: number) => {
    setPrices(prevPrices => prevPrices.filter(price => price.id !== id))
  }

  const handleSave = async () => {
    const isEditing = prices.some(price => price.isEditing)

    if (isEditing) {
      alert('Please finish editing all fields before saving.')
      return
    }

    if (gasStation) {
      const updatedPrices = prices.filter(price => {
        const originalPrice = originalPrices.find(p => p.id === price.id)
        return (
          originalPrice &&
          (originalPrice.label !== price.label ||
            originalPrice.value !== price.value)
        )
      })

      const newPrices = prices.filter(
        price => !originalPrices.some(p => p.id === price.id)
      )

      const deletedPrices = originalPrices.filter(
        originalPrice => !prices.some(price => price.id === originalPrice.id)
      )

      try {
        // Update existing prices
        if (updatedPrices.length > 0) {
          await axios.patch(
            `https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/prices/update_bulk`,
            {
              prices: updatedPrices.map(price => ({
                id: price.id,
                name: price.label,
                value: parseFloat(price.value!.replace(',', '.')),
                station_id: gasStationId,
              })),
            }
          )
        }

        // Create new prices
        if (newPrices.length > 0) {
          await axios.post(
            `https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/prices/create_bulk`,
            {
              prices: newPrices.map(price => ({
                name: price.label,
                value: parseFloat(price.value!.replace(',', '.')),
                station_id: gasStationId,
              })),
            }
          )
        }

        // Delete removed prices
        if (deletedPrices.length > 0) {
          await axios.post(
            `https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/prices/delete_bulk`,
            {
              price_ids: deletedPrices.map(price => price.id),
            }
          )
        }

        navigation.navigate('Home')
      } catch (error) {
        console.error('Error saving data:', error)
      }
    }
  }

  return (
    <View style={styles.container}>
      {gasStation ? (
        <>
          <Text style={styles.heading}>{gasStation.name}</Text>
          <View style={styles.priceSection}>
            {prices.map(({ id, label, value, isEditing }) => (
              <View key={id} style={styles.priceRow}>
                <View style={styles.priceLabelContainer}>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      placeholder="Tipo de combustível"
                      value={label}
                      onChangeText={text => updatePriceField(id, 'label', text)}
                    />
                  ) : (
                    <Text style={styles.priceText}>{label}</Text>
                  )}
                </View>
                <View style={styles.priceInputContainer}>
                  {isEditing ? (
                    <TextInput
                      keyboardType="numeric"
                      returnKeyType="done"
                      style={styles.input}
                      value={value}
                      onChangeText={text => updatePriceField(id, 'value', text)}
                    />
                  ) : (
                    <Text style={styles.priceText}>R$ {value}</Text>
                  )}
                </View>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity onPress={() => toggleEditing(id)}>
                    <AntDesign
                      name={isEditing ? 'check' : 'edit'}
                      size={24}
                      color="black"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deletePriceField(id)}>
                    <AntDesign name="delete" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addPriceField}>
              <AntDesign name="pluscircle" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <Button title="Salvar" onPress={handleSave} />
        </>
      ) : (
        <Text>Carregando...</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 10,
  },
  priceSection: {
    marginTop: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabelContainer: {
    flex: 1,
    marginRight: 10,
  },
  priceInputContainer: {
    flex: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 20,
    gap: 5,
  },
  addButton: {
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
})

export default EditGasStation
