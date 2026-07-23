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
import LegacyElIcon from "@/components/global/LegacyElIcon.vue";
import { resolveLegacyIcon } from "@/core/legacy-icon-map";

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
  app.component("legacy-el-icon", LegacyElIcon);
  app.config.globalProperties.$legacyIcon = resolveLegacyIcon;
  app.use(UserCard);
}
