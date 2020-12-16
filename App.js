import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
// import { createStackNavigator } from 'react-navigation-stack';
import DashboardComponent from "./DashboardComponent";
import FocusComponent from "./FocusComponent";

const RootStack = createSwitchNavigator(
    {
        Focus: FocusComponent,
        Tasks: DashboardComponent,
    },
    {
        initialRouteName: 'Tasks',
    }
);

const AppContainer = createAppContainer(RootStack);

export default class App extends React.Component {
    render() {
        return (
            <AppContainer>
                <StatusBar />
            </AppContainer>
        );
    }
}