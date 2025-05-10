import { Route, Switch } from "wouter";
import PageTemplate from "@/pages/PageTemplate";
import LabelDesign from "@/pages/LabelDesign";
import Print from "@/pages/Print";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";

function App() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={PageTemplate} />
        <Route path="/templates" component={PageTemplate} />
        <Route path="/designs" component={LabelDesign} />
        <Route path="/print" component={Print} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

export default App;
