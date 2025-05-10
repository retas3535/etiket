import { Link, useLocation } from "wouter";

interface TabItem {
  id: string;
  name: string;
  path: string;
}

const tabs: TabItem[] = [
  { id: "tab-templates", name: "Sayfa Şablonu", path: "/templates" },
  { id: "tab-designs", name: "Etiket Tasarımı", path: "/designs" },
  { id: "tab-print", name: "Baskı", path: "/print" },
];

export default function TabNavigation() {
  const [location] = useLocation();
  
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const isActive = location === tab.path || (tab.path === "/templates" && location === "/");
            return (
              <Link 
                key={tab.id}
                to={tab.path}
                className={`py-4 px-1 font-medium text-sm focus:outline-none ${
                  isActive 
                    ? "tab-active text-primary border-b-2 border-primary" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
