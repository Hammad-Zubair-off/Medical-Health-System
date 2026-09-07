import type { RouteObject } from "react-router";
import Calendars from "../components/pages/application-modules/application/calendar/calendar";
import CallHistory from "../components/pages/application-modules/application/calls/callHistory";
import Chat from "../components/pages/application-modules/application/chat/chat";
import Contacts from "../components/pages/application-modules/application/contacts/contacts";
import Email from "../components/pages/application-modules/application/email/email";
import FileManager from "../components/pages/application-modules/application/file-manager/fileManager";
import IncomingCall from "../components/pages/application-modules/application/calls/incomingCall";
import Invoice from "../components/pages/application-modules/application/invoice/invoice";
import InvoiceDetails from "../components/pages/application-modules/invoice-details/invoiceDetails";
import KanbanView from "../components/pages/application-modules/application/kanban-view/kanbanView";
import Notes from "../components/pages/application-modules/application/notes/notes";
import OutGoingCall from "../components/pages/application-modules/application/calls/outGoingCall";
import SearchList from "../components/pages/application-modules/application/search-list/searchList";
import SocialFeed from "../components/pages/application-modules/application/social-feed/socialFeed";
import Todo from "../components/pages/application-modules/application/todo/todo";
import TodoList from "../components/pages/application-modules/application/todo/todoList";
import VideoCall from "../components/pages/application-modules/application/calls/videoCall";
import VoiceCalls from "../components/pages/application-modules/application/calls/voiceCall";
import { all_routes } from "./all_routes";

const routes = all_routes;

export const sharedRoutes: RouteObject[] = [
  {
    path: routes.chat,
    element: <Chat />,
  },
  {
    path: routes.voiceCall,
    element: <VoiceCalls />,
  },
  {
    path: routes.videoCall,
    element: <VideoCall />,
  },
  {
    path: routes.outgoingCall,
    element: <OutGoingCall />,
  },
  {
    path: routes.incomingCall,
    element: <IncomingCall />,
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
