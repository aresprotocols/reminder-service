declare namespace Express {
  interface CustomSessionFields {
    myCustomField: string
  }

  export interface Request {
    session: Session & Partial<SessionData> & CustomSessionFields
  }
}