// GasStationItem.tsx
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

interface GasStationItemProps {
  item: GasStationType
  isLiked: (stationId: number) => boolean
  isDisliked: (stationId: number) => boolean
  handleLike: (stationId: number) => void
  handleDislike: (stationId: number) => void
  navigation: any // Adjust type as needed
}

const GasStationItem: React.FC<GasStationItemProps> = ({
  item,
  isLiked,
  isDisliked,
  handleLike,
  handleDislike,
  navigation,
}) => {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('GasStationDetails', { gasStation: item })
      }
      style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.name}</Text>
        <Text>
          {item.city}, {item.state}
        </Text>
        <Text>{item.address}</Text>
      </View>
      <View style={{ flex: 1 }}>
        {item.price && item.price.length > 0 && (
          <View>
            <Text style={styles.subTitle}>Preços:</Text>
            {item.price.slice(0, 3).map(currentPrice => (
              <Text key={currentPrice.id}>
                <Text numberOfLines={1} style={{ flex: 1 }}>
                  {currentPrice.name}: R${' '}
                  {currentPrice.price?.toString().replace('.', ',')}
                </Text>
              </Text>
            ))}
          </View>
        )}
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          flex: 1,
        }}>
        <Text>{item.total_reactions}</Text>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={() => handleLike(item.id)}>
            <MaterialIcons
              name={isLiked(item.id) ? 'thumb-up' : 'thumb-up-off-alt'}
              size={40}
              color="black"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handleDislike(item.id)}>
          <MaterialIcons
            name={isDisliked(item.id) ? 'thumb-down' : 'thumb-down-off-alt'}
            size={40}
            color="black"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#ccaf',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
  },
})

export default GasStationItem
