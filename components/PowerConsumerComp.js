import { Button } from "react-native-elements";
import { View, Text } from "react-native-reanimated/lib/typescript/Animated";


export default function PowerConsumerComp(item, update ){
    return (
        <View>
            <Text>{item.name}</Text>
            <Text>{item.kWhy}</Text>
            <Text>{item.calcs[0]}</Text>
            <Text>{item.calcs[1]}</Text>
            <Text>{item.calcs[2]}</Text>
            <Text>{item.calcs[3]}</Text>
            <Button onPress={update(item)}>Edit</Button>
        </View>
    )
}