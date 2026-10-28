import {ReactNode} from "react";
import styles from "./PageLayout.module.css";

interface PageLayout {
    children: ReactNode;
    sidebar: ReactNode;
}

export default function PageLayout({children, sidebar,}: PageLayout) {
    return (
        <div className={styles.Layout}>
            <div className={styles.Main}>
                {children}
            </div>

            <main className={styles.Sidebar}>
                {sidebar}
            </main>
        </div>
    )
}