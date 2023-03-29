import './App.css';
import Home from "./components/home/Home";
import {createTheme, ThemeProvider} from "@mui/material";

const theme = createTheme({
    palette: {
        mode: 'dark',
    }
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <Home></Home>
            </div>
        </ThemeProvider>
    );
}
export default App;
