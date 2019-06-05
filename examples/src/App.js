import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Basic from "./basic";
import SimpleTransform from "./simpletransform";
import CodependantData from "./codependantdata";
import NestedData from "./nesteddata";

function App() {
  return (
    <Tabs>
    <TabList>
      <Tab>Basics</Tab>
      <Tab>Simple Transform</Tab>
      <Tab>Codependant Data</Tab>
      <Tab>Nested Data</Tab>
    </TabList>
    <TabPanel>
      <Basic />
    </TabPanel>
    <TabPanel>
      <SimpleTransform />
    </TabPanel>
    <TabPanel>
      <CodependantData />
    </TabPanel>
    <TabPanel>
      <NestedData />
    </TabPanel>
  </Tabs>
  );
}

export default App;
