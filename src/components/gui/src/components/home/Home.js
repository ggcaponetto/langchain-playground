import {useEffect} from "react";
import {TextField} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';

export default function Home(){
    useEffect(()=>{

    }, [])
    const onClick = () => {

    }
    return (
        <div>
            <TextField
                placeholder={"Search"}
                fullWidth={true}
            />
            <LoadingButton
                fullWidth={true}
                onClick={onClick}
            >
                Load
            </LoadingButton>
        </div>
    )
}