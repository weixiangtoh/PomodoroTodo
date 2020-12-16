import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

class FocusComponent extends React.Component {
    render() {
        return (
            <View style={styles.focusStyle}>
                <Text>Focus Screen</Text>
                <Button
                    title="Go to Dashboard Screen"
                    onPress={() => {this.props.navigation.navigate('Tasks')}}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    focusStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'yellow'
    }
});

export default FocusComponent;