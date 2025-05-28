import React, { useRef, useState } from 'react';

function App() {
  const workerRef = useRef<Worker | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const chunkSize = 500;
  const environment = '50b7a7db-965b-4a2e-8f58-39e635bf39b5';
  const companyId = 'f08e82f1-72e8-ef11-9345-6045bd14c5d0';
  const baseUrl = `https://api.businesscentral.dynamics.com/v2.0/${environment}/UAT/api/alletec/primavera/v2.0/companies(${companyId})`;

  async function getAccessToken(): Promise<string> {
    const response = await fetch('https://xml-to-bc-backend.onrender.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to get access token: ${errText}`);
    }
    const data = await response.json();
    return data.access_token;
  }

function toDateTimeOffset(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
}


function parseIntOrNull(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}


function parseFloatOrNull(value: string | null | undefined): number | null {
  const parsed = parseFloat(value ?? '');
  return isNaN(parsed) ? null : parsed;
}

function parseBool(value: any): boolean | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === '1') return true;
    if (v === '0') return false;
  }
  if (typeof value === 'number') {
    return value === 1 ? true : value === 0 ? false : null;
  }
  return null;
}


function parseDateOrDefault(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString(); 
}

const extractActivityFields = (record: any) => ({
  objectId: parseIntOrNull(record?.ObjectId),
  guid: String(record?.GUID ?? ''),
  id: String(record?.Id ?? ''),
  name: String(record?.Name ?? ''),
  status: String(record?.Status ?? ''),
  type: String(record?.Type ?? ''),
  calendarObjectId: parseIntOrNull(record?.CalendarObjectId),
  projectObjectId: parseIntOrNull(record?.ProjectObjectId),
  wbsObjectId: parseIntOrNull(record?.WBSObjectId),
  startDate: toDateTimeOffset(record?.StartDate),
  finishDate: toDateTimeOffset(record?.FinishDate),
  plannedStartDate: toDateTimeOffset(record?.PlannedStartDate),
  plannedFinishDate: toDateTimeOffset(record?.PlannedFinishDate),
  remainingEarlyStartDate: toDateTimeOffset(record?.RemainingEarlyStartDate),
  remainingEarlyFinishDate: toDateTimeOffset(record?.RemainingEarlyFinishDate),
  remainingLateStartDate: toDateTimeOffset(record?.RemainingLateStartDate),
  remainingLateFinishDate: toDateTimeOffset(record?.RemainingLateFinishDate),
  actualStartDate: toDateTimeOffset(record?.ActualStartDate),
  actualFinishDate: toDateTimeOffset(record?.ActualFinishDate),
  expectedFinishDate: toDateTimeOffset(record?.ExpectedFinishDate),
  primaryConstraintDate: toDateTimeOffset(record?.PrimaryConstraintDate),
  secondaryConstraintDate: toDateTimeOffset(record?.SecondaryConstraintDate),
  suspendDate: toDateTimeOffset(record?.SuspendDate),
  resumeDate: toDateTimeOffset(record?.ResumeDate),
  durationType: String(record?.DurationType ?? ''),
  primaryConstraintType: String(record?.PrimaryConstraintType ?? ''),
  secondaryConstraintType: String(record?.SecondaryConstraintType ?? ''),
  percentCompleteType: String(record?.PercentCompleteType ?? ''),
  levelingPriority: String(record?.LevelingPriority ?? ''),
  notesToResources: String(record?.NotesToResources ?? ''),
  feedback: String(record?.Feedback ?? ''),
  isNewFeedback: parseBool(record?.IsNewFeedback),
  reviewRequired: parseBool(record?.ReviewRequired),
  autoComputeActuals: parseBool(record?.AutoComputeActuals),
  estimatedWeight: parseFloatOrNull(record?.EstimatedWeight),
  durationPercentComplete: parseFloatOrNull(record?.DurationPercentComplete),
  scopePercentComplete: parseFloatOrNull(record?.ScopePercentComplete),
  unitsPercentComplete: parseFloatOrNull(record?.UnitsPercentComplete),
  nonLaborUnitsPerComplete: parseFloatOrNull(record?.NonLaborUnitsPercentComplete),
  percentComplete: parseFloatOrNull(record?.PercentComplete),
  physicalPercentComplete: parseFloatOrNull(record?.PhysicalPercentComplete),
  actualDuration: parseFloatOrNull(record?.ActualDuration),
  plannedDuration: parseFloatOrNull(record?.PlannedDuration),
  remainingDuration: parseFloatOrNull(record?.RemainingDuration),
  atCompletionDuration: parseFloatOrNull(record?.AtCompletionDuration),
  plannedLaborUnits: parseFloatOrNull(record?.PlannedLaborUnits),
  remainingLaborUnits: parseFloatOrNull(record?.RemainingLaborUnits),
  atCompletionLaborUnits: parseFloatOrNull(record?.AtCompletionLaborUnits),
  actualLaborUnits: parseFloatOrNull(record?.ActualLaborUnits),
  actualThisPeriodLaborUnits: parseFloatOrNull(record?.ActualThisPeriodLaborUnits),
  plannedNonLaborUnits: parseFloatOrNull(record?.PlannedNonLaborUnits),
  remainingNonLaborUnits: parseFloatOrNull(record?.RemainingNonLaborUnits),
  atCompletionNonLaborUnits: parseFloatOrNull(record?.AtCompletionNonLaborUnits),
  actualNonLaborUnits: parseFloatOrNull(record?.ActualNonLaborUnits),
  actThisPeriodNonLaborUnits: parseFloatOrNull(record?.ActualThisPeriodNonLaborUnits),
  plannedLaborCost: parseFloatOrNull(record?.PlannedLaborCost),
  remainingLaborCost: parseFloatOrNull(record?.RemainingLaborCost),
  atCompletionLaborCost: parseFloatOrNull(record?.AtCompletionLaborCost),
  actualLaborCost: parseFloatOrNull(record?.ActualLaborCost),
  actualThisPeriodLaborCost: parseFloatOrNull(record?.ActualThisPeriodLaborCost),
  plannedNonLaborCost: parseFloatOrNull(record?.PlannedNonLaborCost),
  remainingNonLaborCost: parseFloatOrNull(record?.RemainingNonLaborCost),
  atCompletionNonLaborCost: parseFloatOrNull(record?.AtCompletionNonLaborCost),
  actualNonLaborCost: parseFloatOrNull(record?.ActualNonLaborCost),
  actThisPeriodNonLaborCost: parseFloatOrNull(record?.ActualThisPeriodNonLaborCost),
  atCompletionExpenseCost: parseFloatOrNull(record?.AtCompletionExpenseCost),
  primaryResourceObjectId: parseIntOrNull(record?.PrimaryResourceObjectId),
  udfTypeObjectId: parseIntOrNull(record?.UDF?.TypeObjectId),
  udfTextValue: String(record?.UDF?.TextValue ?? ''),
  codeTypeObjectId1: parseIntOrNull(record?.Code?.[0]?.TypeObjectId),
  codeValueObjectId1: parseIntOrNull(record?.Code?.[0]?.ValueObjectId),
  codeTypeObjectId2: parseIntOrNull(record?.Code?.[1]?.TypeObjectId),
  codeValueObjectId2: parseIntOrNull(record?.Code?.[1]?.ValueObjectId),
  codeTypeObjectId3: parseIntOrNull(record?.Code?.[2]?.TypeObjectId),
  codeValueObjectId3: parseIntOrNull(record?.Code?.[2]?.ValueObjectId),
  codeTypeObjectId4: parseIntOrNull(record?.Code?.[3]?.TypeObjectId),
  codeValueObjectId4: parseIntOrNull(record?.Code?.[3]?.ValueObjectId),
  codeTypeObjectId5: parseIntOrNull(record?.Code?.[4]?.TypeObjectId),
  codeValueObjectId5: parseIntOrNull(record?.Code?.[4]?.ValueObjectId),
  codeTypeObjectId6: parseIntOrNull(record?.Code?.[5]?.TypeObjectId),
  codeValueObjectId6: parseIntOrNull(record?.Code?.[5]?.ValueObjectId),
  codeTypeObjectId7: parseIntOrNull(record?.Code?.[6]?.TypeObjectId),
  codeValueObjectId7: parseIntOrNull(record?.Code?.[6]?.ValueObjectId),
  codeTypeObjectId8: parseIntOrNull(record?.Code?.[7]?.TypeObjectId),
  codeValueObjectId8: parseIntOrNull(record?.Code?.[7]?.ValueObjectId),
  codeTypeObjectId9: parseIntOrNull(record?.Code?.[8]?.TypeObjectId),
  codeValueObjectId9: parseIntOrNull(record?.Code?.[8]?.ValueObjectId),
  uploadDate: new Date().toISOString().split('T')[0],
});


const extractResourceAssignmentFields = (record: any) => ({
  ObjectId: parseIntOrNull(record?.ObjectId),
  GUID: (record?.GUID ?? "").replace(/[{}]/g, ''),  // remove curly braces exactly as snippet
  ProjectObjectId: parseIntOrNull(record?.ProjectObjectId),
  WBSObjectId: parseIntOrNull(record?.WBSObjectId),
  ResourceObjectId: parseIntOrNull(record?.ResourceObjectId),
  ActivityObjectId: parseIntOrNull(record?.ActivityObjectId),
  CostAccountObjectId: parseIntOrNull(record?.CostAccountObjectId),
  ResourceCurveObjectId: parseIntOrNull(record?.ResourceCurveObjectId),
  RoleObjectId: parseIntOrNull(record?.RoleObjectId),

  ActualCost: parseFloatOrNull(record?.ActualCost),
  ActualCurve: typeof record?.ActualCurve === "string" ? record.ActualCurve : "",
  ActualFinishDate: parseDateOrDefault(record?.ActualFinishDate),
  ActualOvertimeCost: parseFloatOrNull(record?.ActualOvertimeCost),
  ActualOvertimeUnits: parseFloatOrNull(record?.ActualOvertimeUnits),
  ActualRegularCost: parseFloatOrNull(record?.ActualRegularCost),
  ActualRegularUnits: parseFloatOrNull(record?.ActualRegularUnits),
  ActualStartDate: parseDateOrDefault(record?.ActualStartDate),
  ActualThisPeriodCost: parseFloatOrNull(record?.ActualThisPeriodCost),
  ActualThisPeriodUnits: parseFloatOrNull(record?.ActualThisPeriodUnits),
  ActualUnits: parseFloatOrNull(record?.ActualUnits),

  AtCompletionCost: parseFloatOrNull(record?.AtCompletionCost),
  AtCompletionUnits: parseFloatOrNull(record?.AtCompletionUnits),

  DrivingActivityDatesFlag: parseBool(record?.DrivingActivityDatesFlag),
  IsCostUnitsLinked: parseBool(record?.IsCostUnitsLinked),
  IsPrimaryResource: parseBool(record?.IsPrimaryResource),

  FinishDate: parseDateOrDefault(record?.FinishDate),
  StartDate: parseDateOrDefault(record?.StartDate),

  PlannedCost: parseFloatOrNull(record?.PlannedCost),
  PlannedCurve: typeof record?.PlannedCurve === "string" ? record.PlannedCurve : "",
  PlannedFinishDate: parseDateOrDefault(record?.PlannedFinishDate),
  PlannedLag: parseIntOrNull(record?.PlannedLag),
  PlannedStartDate: parseDateOrDefault(record?.PlannedStartDate),
  PlannedUnits: parseFloatOrNull(record?.PlannedUnits),
  PlannedUnitsPerTime: parseFloatOrNull(record?.PlannedUnitsPerTime),

  RemainingCost: parseFloatOrNull(record?.RemainingCost),
 RemainingCurve: typeof record?.RemainingCurve === "string" ? record.RemainingCurve : "",
  RemainingDuration: parseFloatOrNull(record?.RemainingDuration),
  RemainingFinishDate: parseDateOrDefault(record?.RemainingFinishDate),
  RemainingLag: parseIntOrNull(record?.RemainingLag),
  RemainingStartDate: parseDateOrDefault(record?.RemainingStartDate),
  RemainingUnits: parseFloatOrNull(record?.RemainingUnits),
  RemainingUnitsPerTime: parseFloatOrNull(record?.RemainingUnitsPerTime),

  OvertimeFactor: parseFloatOrNull(record?.OvertimeFactor),
  PricePerUnit: parseFloatOrNull(record?.PricePerUnit),

  Proficiency: record?.Proficiency ?? "",
  RateSource: record?.RateSource ?? "",
  RateType: record?.RateType ?? "",

  UnitsPercentComplete: parseFloatOrNull(record?.UnitsPercentComplete),
  ResourceType: record?.ResourceType ?? "",

  UploadDate: new Date().toISOString().split("T")[0], // use current date as YYYY-MM-DD string
});



const extractProjectFields = (record: any) => ({
    objectId: parseIntOrNull(record?.ObjectId ?? ''),
    wbsObjectId: parseIntOrNull(record?.WBSObjectId ?? ''),
    actDefCalendarObjectId: parseIntOrNull(record?.ActivityDefaultCalendarObjectId ?? ''),
    actDefCostAccountObjectId: parseIntOrNull(record?.ActivityDefaultCostAccountObjectId ?? ''),
    actDefPercentCompleteType: record?.ActivityDefaultPercentCompleteType ?? '',
    actDefaultPricePerUnit: parseFloatOrNull(record?.ActivityDefaultPricePerUnit ?? ''),
    actIdBasedOnSelectedAct: parseBool(record?.ActivityIdBasedOnSelectedActivity ?? ''),
    actPerComplBaseOnActStep: parseBool(record?.ActivityPercentCompleteBasedOnActivitySteps ?? ''),
    activityDefaultActivityType: record?.ActivityDefaultActivityType ?? '',
    activityDefaultDurationType: record?.ActivityDefaultDurationType ?? '',
    activityIdIncrement: parseIntOrNull(record?.ActivityIdIncrement ?? ''),
    activityIdPrefix: record?.ActivityIdPrefix ?? '',
    activityIdSuffix: record?.ActivityIdSuffix ?? '',
    addActualToRemaining: parseBool(record?.AddActualToRemaining ?? ''),
    addedBy: record?.AddedBy ?? '',
    allowNegActualUnitsFlag: parseBool(record?.AllowNegativeActualUnitsFlag ?? ''),
    allowStatusReview: parseBool(record?.AllowStatusReview ?? ''),
    annualDiscountRate: parseFloatOrNull(record?.AnnualDiscountRate ?? ''),
    anticipatedFinishDate: formatDate(record?.AnticipatedFinishDate ?? ''),
    anticipatedStartDate: formatDate(record?.AnticipatedStartDate ?? ''),
    assigDefaultDrivingFlag: parseBool(record?.AssignmentDefaultDrivingFlag ?? ''),
    assignmentDefaultRateType: record?.AssignmentDefaultRateType ?? '',
    checkOutStatus: parseBool(record?.CheckOutStatus ?? ''),
    costQuantityRecalculateFlag: parseBool(record?.CostQuantityRecalculateFlag ?? ''),
    criticalActivityFloatLimit: parseIntOrNull(record?.CriticalActivityFloatLimit ?? ''),
    criticalActivityPathType: record?.CriticalActivityPathType ?? '',
    currBLProjectObjectId: parseIntOrNull(record?.CurrentBaselineProjectObjectId ?? ''),
    dataDate: formatDate(record?.DataDate ?? ''),
    dateAdded: formatDate(record?.DateAdded ?? ''),
    defaultPriceTimeUnits: record?.DefaultPriceTimeUnits ?? '',
    discountApplicationPeriod: typeof record?.discountApplicationPeriod === 'string' ? record.discountApplicationPeriod : '',
    earnedValueComputeType: record?.EarnedValueComputeType ?? '',
    earnedValueETCComputeType: record?.EarnedValueETCComputeType ?? '',
    earnedValueETCUserValue: parseFloatOrNull(record?.EarnedValueETCUserValue ?? ''),
    earnedValueUserPercent: parseFloatOrNull(record?.EarnedValueUserPercent ?? ''),
    enableSummarization: parseBool(record?.EnableSummarization ?? ''),
    financialPeriodTemplateId: parseIntOrNull(record?.FinancialPeriodTemplateId ?? ''),
    fiscalYearStartMonth: parseIntOrNull(record?.FiscalYearStartMonth ?? ''),
    guid: record?.GUID ?? '00000000-0000-0000-0000-000000000000',
    id: record?.Id ?? '',
    independentETCLaborUnits: parseFloatOrNull(record?.IndependentETCLaborUnits ?? ''),
    independentETCTotalCost: parseFloatOrNull(record?.IndependentETCTotalCost ?? ''),
    lastFinPeriodObjectId: parseIntOrNull(record?.LastFinancialPeriodObjectId ?? ''),
    levelingPriority: parseIntOrNull(record?.LevelingPriority ?? ''),
    linkActualToActThisPeriod: parseBool(record?.LinkActualToActualThisPeriod ?? ''),
    linkPerCompleteWithActual: parseBool(record?.LinkPercentCompleteWithActual ?? ''),
    linkPlannedAndAtComplFlag: parseBool(record?.LinkPlannedAndAtCompletionFlag ?? ''),
    mustFinishByDate: formatDate(record?.MustFinishByDate ?? ''),
    name: record?.Name ?? '',
    obsObjectId: parseIntOrNull(record?.OBSObjectId ?? ''),
    originalBudget: parseFloatOrNull(record?.OriginalBudget ?? ''),
    parentEPSObjectId: parseIntOrNull(record?.ParentEPSObjectId ?? ''),
    plannedStartDate: formatDate(record?.PlannedStartDate ?? ''),
    primResCanMarkActAsCompl: parseBool(record?.PrimaryResourcesCanMarkActivitiesAsCompleted ?? ''),
    projectForecastStartDate: formatDate(record?.ProjectForecastStartDate ?? ''),
    resCanAssignThemselToAct: parseBool(record?.ResourcesCanAssignThemselvesToActivities ?? ''),
    resCanBeAssToSameActMoreOnce: parseBool(record?.ResourceCanBeAssignedToSameActivityMoreThanOnce ?? ''),
    resetPlannToRemainingFlag: parseBool(record?.ResetPlannedToRemainingFlag ?? ''),
    scheduledFinishDate: formatDate(record?.ScheduledFinishDate ?? ''),
    status: record?.Status ?? '',
    strategicPriority: parseIntOrNull(record?.StrategicPriority ?? ''),
    summarizeToWBSLevel: parseIntOrNull(record?.SummarizeToWBSLevel ?? ''),
    summaryLevel: parseIntOrNull(record?.SummaryLevel ?? ''),
    uploadDate: new Date().toISOString().split('T')[0],
    useProjBLForEarnedValue: parseBool(record?.UseProjectBaselineForEarnedValue ?? ''),
    wbsCodeSeparator: record?.WBSCodeSeparator ?? '',
    webSiteRootDirectory: getPrimitiveValue(record?.WebSiteRootDirectory, 'Path') ?? '',
   webSiteURL: getPrimitiveValue(record?.WebSiteURL, 'Url') ?? '',

});


const formatDate = (val: any): string | null => {
  if (!val) return null;
  const date = new Date(val);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};


const getPrimitiveValue = (field: any, propName?: string) => {
  if (field === null || field === undefined) return null;
  if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean') return field;
  if (propName && field[propName] !== undefined) return field[propName];
  return null;
};

const extractResourceFields = (record: any) => ({
  objectId: parseIntOrNull(record?.ObjectId),
  autoComputeActuals: parseBool(record?.AutoComputeActuals),
  calculateCostFromUnits: parseBool(record?.CalculateCostFromUnits),
  calendarObjectId: parseIntOrNull(record?.CalendarObjectId),
  currencyObjectId: parseIntOrNull(record?.CurrencyObjectId),
  defaultUnitsPerTime: parseFloatOrNull(record?.DefaultUnitsPerTime),

  emailAddress: getPrimitiveValue(record?.EmailAddress, 'address'),
  employeeId: getPrimitiveValue(record?.EmployeeId, 'id'),
  GUID: (record?.GUID ?? "").replace(/[{}]/g, ''),
  id: record?.Id || null,

  isActive: parseBool(record?.IsActive),
  isOverTimeAllowed: parseBool(record?.IsOverTimeAllowed),
  name: record?.Name?.trim() || null,
  officePhone: getPrimitiveValue(record?.OfficePhone, 'number'),
  otherPhone: getPrimitiveValue(record?.OtherPhone, 'number'),

  overtimeFactor: parseFloatOrNull(record?.OvertimeFactor),
  parentObjectId: parseIntOrNull(record?.ParentObjectId),
  primaryRoleObjectId: parseIntOrNull(record?.PrimaryRoleObjectId),

  resourceNotes: getPrimitiveValue(record?.ResourceNotes),  // <-- fix here

  resourceType: record?.ResourceType || null,
  sequenceNumber: parseIntOrNull(record?.SequenceNumber),
  shiftObjectId: parseIntOrNull(record?.ShiftObjectId),
  timesheetApprMngrObjectId: parseIntOrNull(record?.TimesheetApprMngrObjectId),
    title: getPrimitiveValue(record?.Title),
  unitOfMeasureObjectId: parseIntOrNull(record?.UnitOfMeasureObjectId),

  uploadDate: new Date().toISOString().split('T')[0],

  useTimesheets: parseBool(record?.UseTimesheets),
  userObjectId: parseIntOrNull(record?.UserObjectId),
});



 const extractWBSFields = (record: any) => ({
  ProjectObjectId: record.ProjectObjectId !== undefined && record.ProjectObjectId !== ''
    ? String(record.ProjectObjectId)
    : null,

  ObjectId: record.ObjectId !== undefined && record.ObjectId !== ''
    ? String(record.ObjectId)
    : null,

  ParentObjectId: record.ParentObjectId !== undefined && record.ParentObjectId !== ''
    ? parseInt(record.ParentObjectId)
    : null,

  AnticipatedFinishDate:
    record.AnticipatedFinishDate
      ? (() => {
          const d = new Date(record.AnticipatedFinishDate);
          return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        })()
      : null,

  AnticipatedStartDate:
    record.AnticipatedStartDate
      ? (() => {
          const d = new Date(record.AnticipatedStartDate);
          return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        })()
      : null,

  Code: String(record.Code ?? ''),

  EarnedValueComputeType: String(record.EarnedValueComputeType ?? ''),

  EarnedValueETCComputeType: String(record.EarnedValueETCComputeType ?? ''),

  EarnedValueETCUserValue:
    record.EarnedValueETCUserValue !== undefined && record.EarnedValueETCUserValue !== ''
      ? parseFloat(record.EarnedValueETCUserValue)
      : null,

  EarnedValueUserPercent:
    record.EarnedValueUserPercent !== undefined && record.EarnedValueUserPercent !== ''
      ? parseFloat(record.EarnedValueUserPercent)
      : null,

  IndependentETCLaborUnits:
    record.IndependentETCLaborUnits !== undefined && record.IndependentETCLaborUnits !== ''
      ? parseFloat(record.IndependentETCLaborUnits)
      : null,

  IndependentETCTotalCost:
    record.IndependentETCTotalCost !== undefined && record.IndependentETCTotalCost !== ''
      ? parseFloat(record.IndependentETCTotalCost)
      : null,

  Name: String(record.Name ?? ''),

  OBSObjectId: record.OBSObjectId !== undefined && record.OBSObjectId !== ''
    ? String(record.OBSObjectId)
    : null,

  OriginalBudget:
    record.OriginalBudget !== undefined && record.OriginalBudget !== ''
      ? parseFloat(record.OriginalBudget)
      : null,

  SequenceNumber:
    record.SequenceNumber !== undefined && record.SequenceNumber !== ''
      ? parseInt(record.SequenceNumber)
      : null,

  Status: record.Status !== undefined && record.Status !== ''
    ? String(record.Status)
    : null,

  UploadDate: record.UploadDate
    ? (() => {
        const d = new Date(record.UploadDate);
        return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
      })()
    : new Date().toISOString().split('T')[0],

  WBSCategoryObjectId:
    record.WBSCategoryObjectId !== undefined && record.WBSCategoryObjectId !== ''
      ? parseInt(record.WBSCategoryObjectId)
      : null,
});


  const sendRecord = async (url: string, record: any, token: string) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  const sendActivityChunk = async (url: string, chunk: any[], token: string) => {
    const payload = { activitys: chunk };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  const sendResourceAssignmentChunk = async (url: string, chunk: any[], token: string) => {
  const payload = { resourceassignments: chunk };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

  const sendResourceChunk = async (url: string, chunk: any[], token: string) => {
    const payload = { resources: chunk };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

const sendWBSChunk = async (url: string, chunk: any[], token: string) => {
  const payload = { wbss: chunk };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage('Parsing XML file...');
    setLoading(true);

    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('./xmlWorker.ts', import.meta.url), { type: 'module' });
      workerRef.current.onerror = (e) => {
        setMessage(`Worker error: ${e.message}`);
        setLoading(false);
      };
    }

    workerRef.current.onmessage = async (event) => {
      const { status, data, message: errorMsg } = event.data;

      if (status !== 'success') {
        setMessage('XML Parse Error: ' + errorMsg);
        setLoading(false);
        return;
      }

      const { wbsArray, projectArray, resourceArray, activityArray, resourceAssignmentArray } = data;

      try {
        setMessage('Fetching access token...');
        const token = await getAccessToken();

        setMessage('Sending Activity data in chunks...');
        for (let i = 0; i < activityArray.length; i += chunkSize) {
          const chunk = activityArray
            .slice(i, i + chunkSize)
            .map((rec: any) => extractActivityFields(rec))
            .filter((rec: any) => rec !== null);
          if (chunk.length > 0)
            await sendActivityChunk(`${baseUrl}/p6activityroots`, chunk, token);
        }

      setMessage('Sending ResourceAssignment data in chunks...');
const validateRecord = (rec: any) => {
  for (const [key, value] of Object.entries(rec)) {
    if (typeof value === 'object' && value !== null) {
      console.error(`Invalid nested object found at field "${key}":`, value);
    }
  }
};

for (let i = 0; i < resourceAssignmentArray.length; i += chunkSize) {
  const chunk = resourceAssignmentArray
    .slice(i, i + chunkSize)
    .map((rec: any) => {
      const mapped = extractResourceAssignmentFields(rec);
      validateRecord(mapped);
      return mapped;
    })
    .filter((rec: any) => rec !== null);

  if (chunk.length > 0)
    await sendResourceAssignmentChunk(`${baseUrl}/p6resourceassignmentroots`, chunk, token);
}



 setMessage('Sending Project data...');
        for (const record of projectArray) {
          const obj = extractProjectFields(record);
          await sendRecord(`${baseUrl}/projects`, obj, token);
        }


setMessage('Sending Resource data in chunks...');
for (let i = 0; i < resourceArray.length; i += chunkSize) {
  console.log(resourceArray)
  const chunk = resourceArray
    .slice(i, i + chunkSize)
    .map((rec: any) => extractResourceFields(rec))
    .filter((rec: any) => rec !== null);
  if (chunk.length > 0)
    console.log("chunk",chunk)
    await sendResourceChunk(`${baseUrl}/p6resources`, chunk, token);
}



setMessage('Sending WBS data in chunks...');
for (let i = 0; i < wbsArray.length; i += chunkSize) {
  const chunk = wbsArray
    .slice(i, i + chunkSize)
    .map((rec: any) => extractWBSFields(rec))
    .filter((rec: any) => rec !== null);
  if (chunk.length > 0)
    await sendWBSChunk(
      `https://api.businesscentral.dynamics.com/v2.0/50b7a7db-965b-4a2e-8f58-39e635bf39b5/UAT/api/alletec/primavera/v2.0/companies(f08e82f1-72e8-ef11-9345-6045bd14c5d0)/p6wbsstagingroots`,
      chunk,
      token
    );
}
        setMessage('All data successfully sent to Business Central.');
      } catch (err: any) {
        console.error(err);
        setMessage(`Error: ${err.message}`);
      }

      setLoading(false);
    };

    workerRef.current.postMessage(file);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>XML to Business Central Uploader</h1>
      <input type="file" accept=".xml" onChange={handleFileUpload} />
      <button
  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleFileUpload;
  }}
  className="submit-button"
  style={{
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    border: '2px solid #0078D4',
    color: '#0078D4',
    backgroundColor: 'transparent',
    borderRadius: '0.4rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }}
>
  Send to Business Central
</button>


      {loading && <p style={{ color: 'blue' }}>Working...</p>}
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
