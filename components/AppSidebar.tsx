import { ChevronDown, BriefcaseMedical, Settings, UsersRound, UserRoundPlus, ScrollText } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { } from 'lucide-react';
import Link from "next/link";



export function AppSidebar() {
  return (
    <Sidebar className="border-gray-800">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="justify-between text-red-400 ">
                      <div className="flex items-center gap-2 text-lg ">
                        <span className="inline-flex h-4 w-4 items-center justify-center  ">
                          <UsersRound className="h-7 w-7" />
                        </span>
                        <span>Doctors</span>
                      </div>

                      {/* chevron rotate when open */}
                      <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-180 " />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-3 border-gray-700">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/doctors/doc-add" className="flex gap-2 items-center  ">
                            <UserRoundPlus className="h-4 w-4" />
                            <span>Add Doctor</span></Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/doctors/doc-list" className="flex gap-2 items-center">
                            <ScrollText className="h-4 w-4" />
                            <span>Doctors List</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/doctors/doc-add" className="flex gap-2 items-center">
                            <BriefcaseMedical className="h-4 w-4" />
                            <span>Specializations</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
