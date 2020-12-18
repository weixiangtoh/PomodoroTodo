import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Button,
    TouchableOpacity,
    Dimensions,
    Animated,
    Vibration,
    KeyboardAvoidingView,
    TextInput,
    Keyboard
} from 'react-native';
import CheckBox from 'react-native-check-box';
import AsyncStorage from "@react-native-community/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';

const INITIAL_WORK_MIN = '25';
const INITIAL_BREAK_MIN = '05';
const INITIAL_SEC = '00';
const WORK_LABEL = 'Work';
const BREAK_LABEL = 'Break';
const START_LABEL = 'Start';
const STOP_LABEL = 'Stop';

let interval = 0;
export default class FocusComponent extends React.Component {
    constructor() {
        super();
        this.state = {
            // store temp todo
            current: [],
            isChecked: false,
            data: [
                // { id: 1, title: 'Walk the dog', done: true },
                // { id: 2, title: 'Find the cat', done: false },
            ],
            isRunning: false,
            icon: "play-circle",
            minutes: INITIAL_WORK_MIN,
            seconds: INITIAL_SEC,
            session: WORK_LABEL,
            buttonLabel: START_LABEL,
            workInputValue: INITIAL_WORK_MIN,
            breakInputValue: INITIAL_BREAK_MIN,
        };

        this.secondsRemaining;

    }

    saveData = async () => {
        console.log('Saving');
        try {
            await AsyncStorage.setItem('todos', JSON.stringify(this.state.data));
            await AsyncStorage.setItem('current', JSON.stringify(this.state.current));

            console.log('Test', AsyncStorage.getItem('todos'));
            // alert('Save is successful!');
            console.log("Save is successful")
        } catch (error) {
            console.log('Error saving');
        }
    };

    loadData = async () => {
        try {
            const value = await AsyncStorage.getItem('current');
            const todos = await AsyncStorage.getItem('todos');
            if (value !== null) {
                console.log('Old data loaded');
                this.setState({ current: JSON.parse(value) });
                this.setState({ data: JSON.parse(todos) });
            }
        } catch (error) {
            Alert.alert('Problem retriving data');
        }
    };

    componentDidMount = () => {
        // initial load
        this.loadData();
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

        // update current 
        this.state.current.done = !this.state.current.done;

        // merge back into the state
        this.setState({
            data: todos,
        });
    };

    strikeThrough = () => {
        let style = styles.listText;

        if (this.state.current.done) {
            style = styles.strikeThrough;
        }

        return style;
    };

    startStopTimer = workSession => {
        // Stop/pause timer
        if (this.state.isRunning) {
            clearInterval(interval);
            return this.setState({
                isRunning: false,
                icon: "play-circle",
                buttonLabel: "Start"
            });
        }
        else {
            this.setState({
                isRunning: true,
                icon: "pause-circle",
                buttonLabel: "Pause"
            });
        }

        if (!this.secondsRemaining) {
            this.secondsRemaining = this.state.minutes
                ? this.state.minutes * 60
                : INITIAL_WORK_MIN * 60;
        }

        this.setupInteval();
    };

    setupInteval = () => {
        clearInterval(interval);

        interval = setInterval(() => this.onTick(), 1000);
    };

    onTick = () => {
        let minutes = Math.floor(this.secondsRemaining / 60);
        let seconds = this.secondsRemaining - minutes * 60;

        minutes = this.normalizeDigits(minutes);
        seconds = this.normalizeDigits(seconds);

        this.setState(previousState => ({
            minutes: minutes,
            seconds: seconds,
        }));

        this.secondsRemaining--;

        if (minutes == 0 && seconds == 0) {

            Vibration.vibrate([500, 500, 500])

            if (this.state.session == WORK_LABEL) {
                this.startBreak();
            } else {
                this.startWork();
            }
        }
    };

    startWork = () => {
        const that = this;

        this.setState(previousState => ({
            minutes: that.normalizeDigits(this.state.workInputValue),
            seconds: INITIAL_SEC,
            session: WORK_LABEL,
            buttonLabel: STOP_LABEL,
        }));

        this.secondsRemaining = this.state.workInputValue * 60;

        this.setupInteval();
    };

    startBreak = () => {
        const that = this;

        this.setState(previousState => ({
            minutes: that.normalizeDigits(this.state.breakInputValue),
            seconds: INITIAL_SEC,
            session: BREAK_LABEL,
            buttonLabel: STOP_LABEL,
        }));

        this.secondsRemaining = this.state.breakInputValue * 60;

        this.setupInteval();
    };

    resetTimer = () => {
        const that = this;

        this.isRunning = false;
        this.secondsRemaining = 0;

        clearInterval(interval);

        this.setState(previousState => ({
            session: WORK_LABEL,
            buttonLabel: START_LABEL,
            seconds: INITIAL_SEC,
            minutes: that.normalizeDigits(previousState.workInputValue),
            icon: "play-circle",
        }));
    };

    onWorkInputChange = workMin => {
        const that = this;

        this.setState(previousState => ({
            workInputValue: workMin,
            minutes: that.normalizeDigits(workMin),
        }));

        this.resetTimer();
    };

    onBreakInputChange = breakMin => {
        const that = this;

        this.setState(previousState => ({
            breakInputValue: breakMin,
            minutes: that.normalizeDigits(this.state.workInputValue),
        }));

        this.resetTimer();
    };

    normalizeDigits = value => {
        if (value.toString().length < 2) {
            return '0' + value;
        }

        return value;
    };

    render() {

        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>

                {/* header */}
                <View style={{ flexDirection: "row", paddingVertical: 15, marginVertical: 20, justifyContent: 'space-between', flex: 0.25 }}>
                    <Text style={{ fontSize: 34, fontWeight: "bold", color: "#fff" }}>Pomodoro Timer</Text>
                    {/* see all tasks */}
                    <TouchableOpacity style={{ padding: 1 }} onPress={() => { this.props.navigation.navigate('Tasks') }}>
                        <Icon name="home" style={{ fontSize: 38, color: "#fff", marginLeft: 7 }} />
                        <Text style={{ color: "#fff" }}>All Tasks</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ justifyContent: "center", alignItems: "center", flex: 2 }}>
                    <View>
                        <Text style={styles.session}>{this.state.session}</Text>
                        <Text style={styles.timer}>
                            {this.state.minutes}:{this.state.seconds}
                        </Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Work Mins:</Text>
                        <TextInput
                            defaultValue={`${this.state.workInputValue}`}
                            maxLength={3}
                            style={styles.input}
                            keyboardType="numeric"
                            onChangeText={this.onWorkInputChange}
                            returnKeyType={ 'done' }
                            />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Break Mins:</Text>
                        <TextInput
                            defaultValue={`${this.state.breakInputValue}`}
                            maxLength={3}
                            style={styles.input}
                            keyboardType="numeric"
                            onChangeText={this.onBreakInputChange}
                            returnKeyType={ 'done' }
                        />
                    </View>

                </View>
                <View style={{ flex: 2 }}>
                    {/* grey background for flatlist */}
                    <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 15, marginBottom: 25}}
                        onPress={() => {
                            this.toggleCheckbox(this.state.current);
                            // save list every time checkbox is clicked
                            setTimeout(() => { this.saveData(); }, 0);
                        }}>
                        <CheckBox
                            style={{ paddingTop: 10, justifyContent: "center" }}
                            onClick={() => {
                                this.toggleCheckbox(this.state.current);
                                // save list every time checkbox is clicked
                                setTimeout(() => { this.saveData(); }, 0);
                            }}
                            isChecked={this.state.current.done}
                            checkBoxColor={"#fff"}
                        />

                        {/* list title stored in async storage 
                            -> navigate to focus screen */}
                        <Text style={this.strikeThrough()}>
                            {this.state.current.title}
                        </Text>

                    </TouchableOpacity>

                    <View style={{ paddingVertical: 13, justifyContent: "center", alignItems: "center", flexDirection: "row" }}>

                        <TouchableOpacity onPress={() => this.startStopTimer()}>
                            <Icon name={this.state.icon} style={{ fontSize: 58, color: "#fff", paddingHorizontal: 15 }} />
                            <Text style={{ color: "#fff", paddingLeft: 28 }}>{this.state.buttonLabel}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.resetTimer()}>
                            <Icon name="stop-circle" style={{ fontSize: 58, color: "#fff", paddingHorizontal: 15 }} />
                            <Text style={{ color: "#fff", paddingLeft: 26 }}>Reset</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </KeyboardAvoidingView >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#2b303b',
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
        fontSize: 18,
        backgroundColor: "#fff"
    },
    listText: {
        fontSize: 32,
        paddingTop: 10,
        paddingLeft: 10,
        color: "#fff"
    },
    strikeThrough: {
        fontSize: 32,
        paddingTop: 10,
        paddingLeft: 10,
        textDecorationLine: 'line-through',
        textDecorationStyle: 'solid',
        color: "#fff"
    },
    session: {
        fontSize: 35,
        textAlign: 'center',
        color: '#f0f0f0',
    },
    timer: {
        fontSize: 90,
        color: '#06bcee',
        padding: 10,
    },
    btnContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    inputLabel: {
        fontSize: 18,
        color: '#f0f0f0',
        paddingRight: 10,
        paddingTop: 5,
        fontWeight: 'bold',
    },
    input: {
        color: '#06bcee',
        borderWidth: 1,
        borderColor: '#4A5568',
        borderRadius: 10,
        fontSize: 18,
        padding: 5,
        textAlign: 'center',
        marginLeft: 5,
        maxWidth: 60,
        minWidth: 40
    },
});