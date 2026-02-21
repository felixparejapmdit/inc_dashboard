import React from "react";
import { Outlet } from "react-router-dom";
import Layout from "./Layout";

const MainLayout = ({ currentUser }) => {
    return (
        <Layout currentUser={currentUser}>
            <Outlet />
        </Layout>
    );
};

export default MainLayout;
