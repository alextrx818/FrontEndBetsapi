import React from 'react';
import ReactJson from 'react-json-view';

const JSONViewer = ({ data }) => {
    return (
        <div>
            <h2>JSON Data Viewer</h2>
            <ReactJson src={data} theme="monokai" />
        </div>
    );
};

export default JSONViewer;