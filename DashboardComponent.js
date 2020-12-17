import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    FlatList,
    TextInput,
    Button,
    KeyboardAvoidingView,
    Keyboard,
    TouchableOpacity,
    Modal,
    ImageBackground,
    Dimensions
} from 'react-native';
import CheckBox from 'react-native-check-box';
import AsyncStorage from "@react-native-community/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';

export default class DashboardComponent extends React.Component {
    constructor() {
        super();
        this.state = {
            // store temp todo
            tempTodo: '',
            isChecked: false,
            data: [
                // { id: 1, title: 'Walk the dog', done: true },
                // { id: 2, title: 'Find the cat', done: false },
            ],
            modalVisible: false,
        };
    }

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    };

    saveData = async () => {
        console.log('Saving');
        try {
            await AsyncStorage.setItem('todos', JSON.stringify(this.state.data));

            console.log('Test', AsyncStorage.getItem('todos'));
            // alert('Save is successful!');
            console.log("Save is successful")
        } catch (error) {
            console.log('Error saving');
        }
    };

    loadData = async () => {
        try {
            const value = await AsyncStorage.getItem('todos');
            if (value !== null) {
                console.log('Old data loaded');
                this.setState({ data: JSON.parse(value) });
            }
        } catch (error) {
            alert('Problem retriving data');
        }
    };

    componentDidMount = () => {
        // initial load
        this.loadData();
    };

    addTodo = () => {
        if (this.state.tempTodo.trim() != '') {
            let newTodo = {
                id: Math.random(1000000, 999999), // naive way of generating an unique
                title: this.state.tempTodo.trim(),
                done: false,
            };

            this.setState({
                tempTodo: '', // reset temp todo to empty,
                data: [...this.state.data, newTodo],
            });

            setTimeout(() => { this.saveData(); }, 0);

            Keyboard.dismiss();
            this.setState({ modalVisible: false });
            alert('Task is added successfully!');
        }
        else {
            this.setState({
                tempTodo: '', // reset temp todo to empty,
            });
        }

    };

    deleteTodo = (item) => {
        // use find index to find the item to delete
        let index = this.state.data.findIndex((each) => {
            return each.id == item.id;
        });
        console.log(index);
        console.log("item: ", item);

        let copy = [...this.state.data];
        copy.splice(index, 1);
        console.log(copy);
        this.setState({
            data: copy,
        });

        setTimeout(() => { this.saveData(); }, 0);
        alert('Task has been deleted!');
    };

    toggleCheckbox = (currentItem) => {
        const todos = [...this.state.data];

        // linear search to find the item to update
        let foundIndex = null;
        for (let i = 0; i < this.state.data.length; i++) {
            if (todos[i].id == currentItem.id) {
                foundIndex = i;
            }
        }
        // if we found the item
        if (foundIndex != null) {
            // clone the todo
            const newTodo = { ...currentItem };
            // inverse it's done status
            newTodo.done = !newTodo.done;

            todos[foundIndex] = newTodo;
        }

        // merge back into the state
        this.setState({
            data: todos,
        });
    };

    renderListItem = (info) => {
        let currentItem = info.item;
        return (
            // get border bottom
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: 15, borderColor: "#9b9b9b", borderBottomWidth: 1 }}>
                <CheckBox
                    style={{ paddingTop: 10 }}
                    onClick={() => {
                        this.toggleCheckbox(currentItem);
                        // save list every time checkbox is clicked
                        setTimeout(() => { this.saveData(); }, 0);
                    }}
                    isChecked={currentItem.done}
                />

                {/* list title stored in async storage 
                        -> navigate to focus screen */}
                <TouchableOpacity style={{ paddingTop: 10, paddingLeft: 10, flex: 1 }} onPress={() => {
                    AsyncStorage.setItem('current', JSON.stringify(currentItem));
                    this.props.navigation.navigate('Focus');
                }}>
                    <Text style={{ fontSize: 18 }}>
                        {currentItem.title}
                    </Text>
                </TouchableOpacity>

                {/* delete button */}
                <View style={{ paddingVertical: 13, paddingHorizontal: 10 }}>
                    <Icon name="trash" style={{ fontSize: 18 }} onPress={() => {
                        this.deleteTodo(currentItem);
                    }} />
                </View>
            </View>
        );
    };

    render() {
        // link modalVisible variable to the variable at state
        const { modalVisible } = this.state;

        return (
            // image background
            <ImageBackground style={styles.backgroundImage} source={require('./assets/tasks.jpg')}>
                {/* container */}
                <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>

                    {/* header */}
                    <View style={{ flexDirection: "row", paddingVertical: 15, marginVertical: 20, justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 34, fontWeight: "bold" }}>
                            Tasks List
                        </Text>

                        {/* add task button */}
                        <TouchableOpacity title="Show Modal" style={{ padding: 1 }} onPress={() => {
                            this.setModalVisible(true);
                        }}>
                            <Icon name="plus" style={{ fontSize: 38, paddingHorizontal: 5, color: "black" }} />
                        </TouchableOpacity>
                    </View>

                    {/* grey background for flatlist */}
                    <View style={styles.flexStyle}>
                        <FlatList
                            renderItem={this.renderListItem}
                            data={this.state.data}
                            keyExtractor={(item) => item.id} />
                    </View>

                    {/* modal component */}
                    <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => {
                        this.setModalVisible(!modalVisible);
                    }}>

                        {/* styling for modals */}
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>

                                {/* modal header */}
                                <Text style={{ fontSize: 20, fontWeight: "bold", paddingBottom: 15 }}>
                                    Add New Task
                                </Text>

                                {/* text input field */}
                                <TextInput
                                    style={styles.textbox}
                                    value={this.state.tempTodo}
                                    onChangeText={(text) => {
                                        this.setState({ tempTodo: text });
                                    }}
                                    placeholder={'Enter todo'}
                                />

                                {/* styling buttons in a row */}
                                <View style={{ paddingTop: 25, flexDirection: "row" }}>

                                    {/* cancel btn */}
                                    <View style={{ paddingRight: 5, width: "50%" }}>
                                        <Button title="Cancel" onPress={() => {
                                            this.setModalVisible(!modalVisible);
                                            this.setState({
                                                tempTodo: '', // reset temp todo to empty,
                                            });
                                        }} />
                                    </View>

                                    {/* add btn */}
                                    <View style={{ paddingLeft: 5, width: "50%" }}>
                                        <Button title="Add" onPress={this.addTodo} />
                                    </View>
                                </View>

                            </View>
                        </View>
                    </Modal>

                </KeyboardAvoidingView >
            </ImageBackground>
        );
    }
}

// get device height
let { height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#ecf0f12d',
        padding: 15,
    },
    textbox: {
        borderColor: '#dbdbdb',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 5,
        height: 45,
        padding: 8,
        marginHorizontal: 5,
        alignContent: 'center',
        width: '100%',
        fontSize: 18
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        width: "90%",
        margin: 20,
        backgroundColor: '#ecf0f1',
        borderRadius: 20,
        paddingVertical: 35,
        paddingHorizontal: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    flexStyle: {
        backgroundColor: '#ecf0f19f',
        borderRadius: 5,
        maxHeight: height - 175
    },
});