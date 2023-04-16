import {useCallback, useEffect, useRef, useState} from "react";
import { useTranslation } from 'react-i18next';
import axios from "axios";
export default function Home(props) {
    const { t, i18n } = useTranslation();
    useEffect(() => {

    }, [])

    return (
        <div
            id={"top-container"}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center"
            }}>
            Hello World!
            <div>
                {t('Welcome to React')}
            </div>
        </div>
    )
}