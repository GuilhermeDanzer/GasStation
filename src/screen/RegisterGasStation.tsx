import React, { useState, useEffect, lazy } from 'react'
import {
  TextInput,
  View,
  Text,
  Button,
  Linking,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import axios, { AxiosResponse } from 'axios'
import * as Location from 'expo-location'
import * as FileSystem from 'expo-file-system'
import Picker, { Item } from 'react-native-picker-select'
import states from '../states.json'
import AntDesign from '@expo/vector-icons/AntDesign'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../App'

type RegisterGasStationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterGasStation'
>

type RegisterGasStationProps = {
  navigation: RegisterGasStationScreenNavigationProp
}

const RegisterGasStation: React.FC<RegisterGasStationProps> = ({
  navigation,
}) => {
  const [name, setName] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [state, setState] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [allCities, setAllCities] = useState<Item[]>([{ label: '', value: '' }])
  const [prices, setPrices] = useState<PriceType[]>([])

  const getCitiesFromState = async () => {
    if (state === '') return

    const response = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`
    )

    const cities = response.data as Municipio[]
    const citiesFormatted = cities.map(city => ({
      label: city.nome,
      value: city.nome,
    }))

    setAllCities(prevAllCities => citiesFormatted)
  }
  const handleSubmit = async () => {
    try {
      // Step 1: Create the gas station
      const save = await axios.post(
        'https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/stations',
        {
          name,
          city,
          state,
          address,
        }
      )

      const { id } = save.data as CreateGasStationResponse

      // Step 2: Prepare the prices data for bulk creation
      const pricesWithFloatValues = prices.map(price => ({
        name: price.label,
        price: parseFloat(price.value!.replace(',', '.')),
        station_id: id, // Ensure that each price is associated with the correct station ID
      }))

      // Step 3: Use the bulk creation endpoint
      const addPrices = await axios.post(
        'https://9a19-2804-1354-8120-4a00-349b-242e-7acf-eac.ngrok-free.app/prices/create_bulk',
        { prices: pricesWithFloatValues }
      )

      if (addPrices.status === 201) {
        // If successful, navigate back
        navigation.goBack()
      }
    } catch (error) {
      console.error('Error during gas station registration:', error)
    }
  }

  const handleDelete = async () => {
    const fileUri = FileSystem.documentDirectory + 'gasStations.json'

    try {
      await FileSystem.deleteAsync(fileUri)
    } catch (error) {
      console.error('Erro ao excluir arquivo', error)
    }
  }

  const addPriceField = () => {
    const newId = prices.length > 0 ? prices[prices.length - 1].id + 1 : 1
    setPrices([...prices, { id: newId, label: '', value: '', isEditing: true }])
  }

  const updatePriceField = (id: number, key: string, value: string) => {
    setPrices(
      prices.map(price =>
        price.id === id ? { ...price, [key]: value } : price
      )
    )
  }

  const toggleEditing = (id: number) => {
    setPrices(
      prices.map(price =>
        price.id === id ? { ...price, isEditing: !price.isEditing } : price
      )
    )
  }

  const deletePriceField = (id: number) => {
    setPrices(prices.filter(price => price.id !== id))
  }

  const isFormValid = () => {
    if (!name || !city || !state || !address) return false
    return prices.some(price => price.label && price.value)
  }

  useEffect(() => {
    getCitiesFromState()
  }, [state])
  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome do Posto</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        <Text style={styles.label}>Estado</Text>
        <Picker
          placeholder={{ value: '', label: 'Selecione o estado' }}
          style={{
            viewContainer:
              Platform.OS === 'android' ? styles.pickerAndroid : styles.picker,
          }}
          onValueChange={item => {
            setState(prevState => item)
          }}
          items={states}
        />
        <Text style={styles.label}>Cidade</Text>
        <Picker
          placeholder={{
            value: '',
            label: 'Selecione a cidade',
            color: '#cecece',
          }}
          style={{
            viewContainer: [
              Platform.OS === 'android' ? styles.pickerAndroid : styles.picker,
              { borderColor: state === '' ? '#cecece' : '#000' },
            ],
          }}
          onValueChange={item => setCity(item)}
          items={allCities}
          disabled={state === ''}
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Preço dos combustíveis</Text>
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
      </View>
      <Button
        title="Cadastrar"
        disabled={!isFormValid()}
        onPress={handleSubmit}
      />
      <Button title="Delete File" onPress={handleDelete} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  inputGroup: {
    gap: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 10,
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
  priceSection: {
    marginTop: 20,
  },
  priceLabel: {
    fontSize: 16,
    marginBottom: 10,
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

export default RegisterGasStation
