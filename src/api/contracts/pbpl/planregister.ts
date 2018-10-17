export interface Plan {
    planid?: number;
    Parentnum?: number;
    PlanNum?: string;
    Title?: string;
    DrawnbyName?: string;
    LocalityNumber?: string;
    LocalityName?: string;
    CreateDate?: MssqlDate;
    Comments?: string;
    Client?: string;
    FileRef?: string;
    DataSource?: string;
    facility_name?: string;
    pdf_type?: boolean;
    taskid?: string;
};

interface MssqlDate {
    date: string;
    timezone_type: number;
    timezone: string;
  }