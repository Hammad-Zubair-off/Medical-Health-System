import type { RouteObject } from "react-router";
import { lazyPage } from "./lazyPage";
import { all_routes } from "./all_routes";

const routes = all_routes;

const Calendars = lazyPage(() => import("../components/pages/application-modules/application/calendar/calendar"));
const CallHistory = lazyPage(() => import("../components/pages/application-modules/application/calls/callHistory"));
const Contacts = lazyPage(() => import("../components/pages/application-modules/application/contacts/contacts"));
const Email = lazyPage(() => import("../components/pages/application-modules/application/email/email"));
const FileManager = lazyPage(() => import("../components/pages/application-modules/application/file-manager/fileManager"));
const Invoice = lazyPage(() => import("../components/pages/application-modules/application/invoice/invoice"));
const InvoiceDetails = lazyPage(() => import("../components/pages/application-modules/invoice-details/invoiceDetails"));
const KanbanView = lazyPage(() => import("../components/pages/application-modules/application/kanban-view/kanbanView"));
const Notes = lazyPage(() => import("../components/pages/application-modules/application/notes/notes"));
const SearchList = lazyPage(() => import("../components/pages/application-modules/application/search-list/searchList"));
const SocialFeed = lazyPage(() => import("../components/pages/application-modules/application/social-feed/socialFeed"));
const Todo = lazyPage(() => import("../components/pages/application-modules/application/todo/todo"));
const TodoList = lazyPage(() => import("../components/pages/application-modules/application/todo/todoList"));
const VideoCall = lazyPage(() => import("../components/pages/application-modules/application/calls/videoCall"));
const ChatRedirect = lazyPage(() => import("../components/pages/chat/ChatRedirect"));

export const sharedRoutes: RouteObject[] = [
  {
    path: routes.chat,
    element: <ChatRedirect />,
  },
  {
    path: routes.videoCall,
    element: <VideoCall />,
  },
  {
    path: routes.callHistory,
    element: <CallHistory />,
  },
  {
    path: routes.calendar,
    element: <Calendars />,
  },
  {
    path: routes.email,
    element: <Email />,
  },
  {
    path: routes.todo,
    element: <Todo />,
  },
  {
    path: routes.todoList,
    element: <TodoList />,
  },
  {
    path: routes.notes,
    element: <Notes />,
  },
  {
    path: routes.socialFeed,
    element: <SocialFeed />,
  },
  {
    path: routes.fileManager,
    element: <FileManager />,
  },
  {
    path: routes.fileManagerFolder,
    element: <FileManager />,
  },
  {
    path: routes.kanbanView,
    element: <KanbanView />,
  },
  {
    path: routes.contacts,
    element: <Contacts />,
  },
  {
    path: routes.invoice,
    element: <Invoice />,
  },
  {
    path: routes.invoiceDetails,
    element: <InvoiceDetails />,
  },
  {
    path: routes.searchList,
    element: <SearchList />,
  },
];
