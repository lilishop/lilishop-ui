export interface LiveOrderStatistics {
  totalAmount?: number
  salesVolume?: number
  dealUserCount?: number
  averageOrderValue?: number
  conversionRate?: number
}

export interface LiveRoomForm {
  title: string
  description?: string
  coverImg: string
  /** 0 横屏 1 竖屏 2 三分屏 */
  displayMode: string
  liveIntroduce?: string
  startTime: string
  endTime?: string
  pushStreamServer?: string
  pushStreamCode?: string
  imSdkAppid?: string | number
  imSdkAppId?: string | number
  sdkAppId?: string | number
  imSdkSecretKey?: string
  sdkSecretKey?: string
  secretKey?: string
  userSig?: string
  imUserSig?: string
  adminUserSig?: string
  imGroupId?: string
  groupId?: string
}

export interface LiveCoupon {
  id?: string
  couponId: string
  couponName: string
  couponPrice: number
  liveRoomId?: string
  liveRoomName?: string
  hideFlag?: boolean
  recommend?: boolean
  issueQuantity?: number
  receivedCount?: number
  usedCount?: number
}

export interface LiveGoodsItem {
  id?: string
  liveRoomId?: string
  goodsId: string
  skuId: string
  goodsName?: string
  stock?: string
  price?: number
  thumbnail?: string
  salesCount?: number
  storeId?: string
  storeName?: string
  originPrice?: number
  sellPoint?: string
  popularity?: number
  hideFlag?: boolean
  canBuyFlag?: boolean
  soldOutFlag?: boolean
  recommend?: boolean
}

export interface LiveMessage {
  id: string
  liveRoomId?: string
  liveUserId?: string
  userId?: string
  userName?: string
  userFace?: string
  message?: string
  authStatus?: string
  createTime?: string
}
