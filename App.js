import './src/firebaseConfig';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/store/authStore';
import AppNavigator from './src/navigation/AppNavigator';
import AppInitializer from './src/components/AppInitializer';
import { COLORS } from './src/constants/colors';

export default function App() {
    return (
        <AppInitializer>
            <AuthProvider>
                <NavigationContainer>
                    <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
                    <AppNavigator />
                </NavigationContainer>
            </AuthProvider>
        </AppInitializer>
    );
}
