export interface Memo {
  name: string
  uid: string
  rowStatus: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
  creator: string
  createTime: string
  updateTime: string
  displayTime: string
  content: string
  visibility: 'PUBLIC' | 'PROTECTED' | 'PRIVATE'
  pinned: boolean
  nodes: any[]
  tags: string[]
  resources: any[]
  relations: any[]
  reactions: any[]
  property: {
    tags: string[]
    hasLink: boolean
    hasTaskList: boolean
    hasCode: boolean
    hasIncompleteTasks: boolean
  }
  snippet: string
}

export interface MemosResponse {
  memos: Memo[]
  nextPageToken?: string
}

export interface PetData {
  nickname: string
  species: string
  endDate?: string
  template?: boolean
  notes?: Array<{
    images?: string[]
    text?: string
    recordedAt?: string
  }>
  careEvents?: {
    watering?: string | string[]
    acidSupplement?: string | string[]
    fertilizing?: string | string[]
    rootingPowderUse?: string | string[]
    ironSupplement?: string | string[]
  }
}

export interface PetMemo {
  name: string
  uid: string
  createTime: string
  updateTime: string
  content: string
  petData: PetData
}
