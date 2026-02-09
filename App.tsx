import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import store from './src/store';
import MainScreen from './src/views/MainScreen';
import AddTodoScreen from './src/views/AddTodoScreen';
import { COLORS } from './src/utils/constants';
import APP_TEXT from './src/utils/appText.json';

export type RootStackParamList = {
  Main: undefined;
  AddTodo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Performance: use native screens implementation when available.
enableScreens();

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
              headerStyle: { backgroundColor: '#FF6B6B' },
              headerShadowVisible: false,
              headerTitleStyle: { color: COLORS.bg },
              headerTintColor: COLORS.bg,
              contentStyle: { backgroundColor: COLORS.bg },
            }}
          >
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{ headerShown: false, title: APP_TEXT.mainScreen.headerTitle }}
            />
            <Stack.Screen
              name="AddTodo"
              component={AddTodoScreen}
              options={{
                title: APP_TEXT.addTodoScreen.title,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
