import {
  AudioMessage,
  CodeMessage,
  ForwardMessage,
  ImageMessage,
  TextMessage,
  VideoMessage,
  VoiceMessage,
  SystemTextMessage,
  FileMessage,
  InviteMessage,
  RevokeMessage,
  VisitCardMessage,
  ReplyMessage,
  VoteMessage,
  LoginMessage,
} from "@/components/chat/messaege";
import UserCard from "@/components/user/user-card/index";

const messageComponents = [
  AudioMessage,
  CodeMessage,
  ForwardMessage,
  ImageMessage,
  TextMessage,
  VideoMessage,
  VoiceMessage,
  SystemTextMessage,
  FileMessage,
  InviteMessage,
  RevokeMessage,
  VisitCardMessage,
  ReplyMessage,
  VoteMessage,
  LoginMessage,
];

export function registerGlobalComponents(app) {
  messageComponents.forEach((component) => {
    app.component(component.name, component);
  });
  app.use(UserCard);
}
