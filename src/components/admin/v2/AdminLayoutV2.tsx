import { ReactNode } from "react";
import { AdminSidebarV2 } from "./AdminSidebarV2";
import { AdminTopBarV2 } from "./AdminTopBarV2";

interface AdminLayoutV2Props {
  children: ReactNode;
}

export const AdminLayoutV2 = ({ children }: AdminLayoutV2Props) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AdminSidebarV2 />
      
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-0">
        <AdminTopBarV2 />
        
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
