import React, { useRef, useState, useEffect } from 'react';

function App() {
  const workerRef = useRef<Worker | null>(null);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0); // 0 to 100
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  });

  // ✅ Then use it in useRef
  const selectedDateRef = useRef<string>(selectedDate);

  // ✅ Keep the ref in sync with latest state
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);
  const chunkSize = 500;
  const environment = '50b7a7db-965b-4a2e-8f58-39e635bf39b5';
  const companyId = '9f813277-f624-f011-9af7-002248cb4a4f';
  const baseUrl = `https://api.businesscentral.dynamics.com/v2.0/${environment}/Dev/api/alletec/primavera/v2.0/companies(${companyId})`;

  async function getAccessToken(): Promise<string> {
    // const response = await fetch('http://localhost:3001/token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    // });
    const response = await fetch('https://xml-to-bc-backend-new.onrender.com/token', {
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

  function isValidGuid(value: string | null | undefined): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value ?? '');
  }

  function normalizeTime(value: string | null | undefined): string {
    if (!value) return '';
    // Replace dots with colons: "07.00.00" → "07:00:00"
    return value.replace(/\./g, ':');
  }

  const extractCalendarFields = (record: any,selectedDate:string) => ({
    objectId: parseIntOrNull(record?.ObjectId),
    uploadDate: selectedDate,
    name: record?.CalendarName || '',
    type: record?.Type || '',
    hoursPerDay: parseFloatOrNull(record?.HoursPerDay),
    hoursPerWeek: parseFloatOrNull(record?.HoursPerWeek),
    hoursPerMonth: parseFloatOrNull(record?.HoursPerMonth),
    hoursPerYear: parseFloatOrNull(record?.HoursPerYear),
    isDefault: parseBool(record?.IsDefault), // you can update this if you have it in the XML
    isPersonal: parseBool(record?.isPersonal), // same as above
    entryType: record?.Type || '',
    dayOrDate: record?.DayOrDate || '',
    start: normalizeTime(record?.StartTime),
    finish: normalizeTime(record?.FinishTime),
  });

  const extractActivityFields = (record: any,selectedDate:string) => ({
    objectId: parseIntOrNull(textVal(record?.ObjectId)),
    guid: isValidGuid(textVal(record?.GUID)) ? textVal(record.GUID) : null,
    id: textVal(record?.Id) || '',
    uploadDate: selectedDate,
    name: textVal(record?.Name) || '',
    status: textVal(record?.Status) || '',
    activityType: textVal(record?.activityType) || '',
    type: textVal(record?.Type) || '',
    calendarObjectId: parseIntOrNull(textVal(record?.CalendarObjectId)),
    projectObjectId: parseIntOrNull(textVal(record?.ProjectObjectId)),
    wbsObjectId: parseIntOrNull(textVal(record?.WBSObjectId)),
    startDate: toDateTimeOffset(textVal(record?.StartDate)),
    finishDate: toDateTimeOffset(textVal(record?.FinishDate)),
    plannedStartDate: toDateTimeOffset(textVal(record?.PlannedStartDate)),
    plannedFinishDate: toDateTimeOffset(textVal(record?.PlannedFinishDate)),
    remainingEarlyStartDate: toDateTimeOffset(textVal(record?.RemainingEarlyStartDate)),
    remainingEarlyFinishDate: toDateTimeOffset(textVal(record?.RemainingEarlyFinishDate)),
    remainingLateStartDate: toDateTimeOffset(textVal(record?.RemainingLateStartDate)),
    remainingLateFinishDate: toDateTimeOffset(textVal(record?.RemainingLateFinishDate)),
    actualStartDate: toDateTimeOffset(textVal(record?.ActualStartDate)),
    actualFinishDate: toDateTimeOffset(textVal(record?.ActualFinishDate)),
    expectedFinishDate: toDateTimeOffset(textVal(record?.ExpectedFinishDate)),
    primaryConstraintDate: toDateTimeOffset(textVal(record?.PrimaryConstraintDate)),
    secondaryConstraintDate: toDateTimeOffset(textVal(record?.SecondaryConstraintDate)),
    suspendDate: toDateTimeOffset(textVal(record?.SuspendDate)),
    resumeDate: toDateTimeOffset(textVal(record?.ResumeDate)),
    durationType: textVal(record?.DurationType) || '',
    primaryConstraintType: textVal(record?.PrimaryConstraintType) || '',
    secondaryConstraintType: textVal(record?.SecondaryConstraintType) || '',
    percentCompleteType: textVal(record?.PercentCompleteType) || '',
    levelingPriority: textVal(record?.LevelingPriority) || '',
    notesToResources: textVal(record?.NotesToResources) || '',
    feedback: textVal(record?.Feedback) || '',
    isNewFeedback: parseBool(textVal(record?.IsNewFeedback)),
    reviewRequired: parseBool(textVal(record?.ReviewRequired)),
    autoComputeActuals: parseBool(textVal(record?.AutoComputeActuals)),
    estimatedWeight: parseFloatOrNull(textVal(record?.EstimatedWeight)),
    durationPercentComplete: parseFloatOrNull(textVal(record?.DurationPercentComplete)),
    scopePercentComplete: parseFloatOrNull(textVal(record?.ScopePercentComplete)),
    unitsPercentComplete: parseFloatOrNull(textVal(record?.UnitsPercentComplete)),
    nonLaborUnitsPerComplete: parseFloatOrNull(textVal(record?.NonLaborUnitsPercentComplete)),
    percentComplete: parseFloatOrNull(textVal(record?.PercentComplete)),
    physicalPercentComplete: parseFloatOrNull(textVal(record?.PhysicalPercentComplete)),
    actualDuration: parseFloatOrNull(textVal(record?.ActualDuration)),
    plannedDuration: parseFloatOrNull(textVal(record?.PlannedDuration)),
    remainingDuration: parseFloatOrNull(textVal(record?.RemainingDuration)),
    atCompletionDuration: parseFloatOrNull(textVal(record?.AtCompletionDuration)),
    plannedLaborUnits: parseFloatOrNull(textVal(record?.PlannedLaborUnits)),
    remainingLaborUnits: parseFloatOrNull(textVal(record?.RemainingLaborUnits)),
    atCompletionLaborUnits: parseFloatOrNull(textVal(record?.AtCompletionLaborUnits)),
    actualLaborUnits: parseFloatOrNull(textVal(record?.ActualLaborUnits)),
    actualThisPeriodLaborUnits: parseFloatOrNull(textVal(record?.ActualThisPeriodLaborUnits)),
    plannedNonLaborUnits: parseFloatOrNull(textVal(record?.PlannedNonLaborUnits)),
    remainingNonLaborUnits: parseFloatOrNull(textVal(record?.RemainingNonLaborUnits)),
    atCompletionNonLaborUnits: parseFloatOrNull(textVal(record?.AtCompletionNonLaborUnits)),
    actualNonLaborUnits: parseFloatOrNull(textVal(record?.ActualNonLaborUnits)),
    actThisPeriodNonLaborUnits: parseFloatOrNull(textVal(record?.ActualThisPeriodNonLaborUnits)),
    plannedLaborCost: parseFloatOrNull(textVal(record?.PlannedLaborCost)),
    remainingLaborCost: parseFloatOrNull(textVal(record?.RemainingLaborCost)),
    atCompletionLaborCost: parseFloatOrNull(textVal(record?.AtCompletionLaborCost)),
    actualLaborCost: parseFloatOrNull(textVal(record?.ActualLaborCost)),
    actualThisPeriodLaborCost: parseFloatOrNull(textVal(record?.ActualThisPeriodLaborCost)),
    plannedNonLaborCost: parseFloatOrNull(textVal(record?.PlannedNonLaborCost)),
    remainingNonLaborCost: parseFloatOrNull(textVal(record?.RemainingNonLaborCost)),
    atCompletionNonLaborCost: parseFloatOrNull(textVal(record?.AtCompletionNonLaborCost)),
    actualNonLaborCost: parseFloatOrNull(textVal(record?.ActualNonLaborCost)),
    actThisPeriodNonLaborCost: parseFloatOrNull(textVal(record?.ActualThisPeriodNonLaborCost)),
    atCompletionExpenseCost: parseFloatOrNull(textVal(record?.AtCompletionExpenseCost)),
    primaryResourceObjectId: parseIntOrNull(textVal(record?.PrimaryResourceObjectId)),
    udfTypeObjectId: parseIntOrNull(textVal(record?.UDF?.TypeObjectId)),
    udfTextValue: textVal(record?.UDF?.TextValue) || '',
    ...[...Array(9)].reduce((acc, _, i) => ({
      ...acc,
      [`codeTypeObjectId${i + 1}`]: parseIntOrNull(textVal(record?.Code?.[i]?.TypeObjectId)),
      [`codeValueObjectId${i + 1}`]: parseIntOrNull(textVal(record?.Code?.[i]?.ValueObjectId)),
    }), {}),
  });



  const extractResourceAssignmentFields = (record: any,selectedDate:string) => ({
    ObjectId: parseIntOrNull(textVal(record?.ObjectId)),
    guid: isValidGuid(textVal(record?.GUID)) ? textVal(record?.GUID) : null,
    ProjectObjectId: parseIntOrNull(textVal(record?.ProjectObjectId)),
    WBSObjectId: parseIntOrNull(textVal(record?.WBSObjectId)),
    ResourceObjectId: parseIntOrNull(textVal(record?.ResourceObjectId)),
    ActivityObjectId: parseIntOrNull(textVal(record?.ActivityObjectId)),
    CostAccountObjectId: parseIntOrNull(textVal(record?.CostAccountObjectId)),
    ResourceCurveObjectId: parseIntOrNull(textVal(record?.ResourceCurveObjectId)),
    RoleObjectId: parseIntOrNull(textVal(record?.RoleObjectId)),

    ActualCost: parseFloatOrNull(textVal(record?.ActualCost)),
    ActualCurve: textVal(record?.ActualCurve) || '',
    ActualFinishDate: parseDateOrDefault(textVal(record?.ActualFinishDate)),
    ActualOvertimeCost: parseFloatOrNull(textVal(record?.ActualOvertimeCost)),
    ActualOvertimeUnits: parseFloatOrNull(textVal(record?.ActualOvertimeUnits)),
    ActualRegularCost: parseFloatOrNull(textVal(record?.ActualRegularCost)),
    ActualRegularUnits: parseFloatOrNull(textVal(record?.ActualRegularUnits)),
    ActualStartDate: parseDateOrDefault(textVal(record?.ActualStartDate)),
    ActualThisPeriodCost: parseFloatOrNull(textVal(record?.ActualThisPeriodCost)),
    ActualThisPeriodUnits: parseFloatOrNull(textVal(record?.ActualThisPeriodUnits)),
    ActualUnits: parseFloatOrNull(textVal(record?.ActualUnits)),

    AtCompletionCost: parseFloatOrNull(textVal(record?.AtCompletionCost)),
    AtCompletionUnits: parseFloatOrNull(textVal(record?.AtCompletionUnits)),

    DrivingActivityDatesFlag: parseBool(textVal(record?.DrivingActivityDatesFlag)),
    IsCostUnitsLinked: parseBool(textVal(record?.IsCostUnitsLinked)),
    IsPrimaryResource: parseBool(textVal(record?.IsPrimaryResource)),

    FinishDate: parseDateOrDefault(textVal(record?.FinishDate)),
    StartDate: parseDateOrDefault(textVal(record?.StartDate)),

    PlannedCost: parseFloatOrNull(textVal(record?.PlannedCost)),
    PlannedCurve: textVal(record?.PlannedCurve) || '',
    PlannedFinishDate: parseDateOrDefault(textVal(record?.PlannedFinishDate)),
    PlannedLag: parseIntOrNull(textVal(record?.PlannedLag)),
    PlannedStartDate: parseDateOrDefault(textVal(record?.PlannedStartDate)),
    PlannedUnits: parseFloatOrNull(textVal(record?.PlannedUnits)),
    PlannedUnitsPerTime: parseFloatOrNull(textVal(record?.PlannedUnitsPerTime)),

    RemainingCost: parseFloatOrNull(textVal(record?.RemainingCost)),
    RemainingCurve: textVal(record?.RemainingCurve) || '',
    RemainingDuration: parseFloatOrNull(textVal(record?.RemainingDuration)),
    RemainingFinishDate: parseDateOrDefault(textVal(record?.RemainingFinishDate)),
    RemainingLag: parseIntOrNull(textVal(record?.RemainingLag)),
    RemainingStartDate: parseDateOrDefault(textVal(record?.RemainingStartDate)),
    RemainingUnits: parseFloatOrNull(textVal(record?.RemainingUnits)),
    RemainingUnitsPerTime: parseFloatOrNull(textVal(record?.RemainingUnitsPerTime)),

    OvertimeFactor: parseFloatOrNull(textVal(record?.OvertimeFactor)),
    PricePerUnit: parseFloatOrNull(textVal(record?.PricePerUnit)),

    Proficiency: textVal(record?.Proficiency) || '',
    RateSource: textVal(record?.RateSource) || '',
    RateType: textVal(record?.RateType) || '',

    UnitsPercentComplete: parseFloatOrNull(textVal(record?.UnitsPercentComplete)),
    ResourceType: textVal(record?.ResourceType) || '',
    uploadDate: selectedDate,
  });



  const extractProjectFields = (record: any,selectedDate:string) => ({
    objectId: parseIntOrNull(textVal(record?.ObjectId)),
    wbsObjectId: parseIntOrNull(textVal(record?.WBSObjectId)),
    actDefCalendarObjectId: parseIntOrNull(textVal(record?.ActivityDefaultCalendarObjectId)),
    actDefCostAccountObjectId: parseIntOrNull(textVal(record?.ActivityDefaultCostAccountObjectId)),
    actDefPercentCompleteType: textVal(record?.ActivityDefaultPercentCompleteType) ?? '',
    actDefaultPricePerUnit: parseFloatOrNull(textVal(record?.ActivityDefaultPricePerUnit)),
    actIdBasedOnSelectedAct: parseBool(textVal(record?.ActivityIdBasedOnSelectedActivity)),
    actPerComplBaseOnActStep: parseBool(textVal(record?.ActivityPercentCompleteBasedOnActivitySteps)),
    activityDefaultActivityType: textVal(record?.ActivityDefaultActivityType) ?? '',
    activityDefaultDurationType: textVal(record?.ActivityDefaultDurationType) ?? '',
    activityIdIncrement: parseIntOrNull(textVal(record?.ActivityIdIncrement)),
    activityIdPrefix: textVal(record?.ActivityIdPrefix) ?? '',
    activityIdSuffix: textVal(record?.ActivityIdSuffix) ?? '',
    addActualToRemaining: parseBool(textVal(record?.AddActualToRemaining)),
    addedBy: textVal(record?.AddedBy) ?? '',
    allowNegActualUnitsFlag: parseBool(textVal(record?.AllowNegativeActualUnitsFlag)),
    allowStatusReview: parseBool(textVal(record?.AllowStatusReview)),
    annualDiscountRate: parseFloatOrNull(textVal(record?.AnnualDiscountRate)),
    anticipatedFinishDate: formatDate(textVal(record?.AnticipatedFinishDate)),
    anticipatedStartDate: formatDate(textVal(record?.AnticipatedStartDate)),
    assigDefaultDrivingFlag: parseBool(textVal(record?.AssignmentDefaultDrivingFlag)),
    assignmentDefaultRateType: textVal(record?.AssignmentDefaultRateType) ?? '',
    checkOutStatus: parseBool(textVal(record?.CheckOutStatus)),
    costQuantityRecalculateFlag: parseBool(textVal(record?.CostQuantityRecalculateFlag)),
    criticalActivityFloatLimit: parseIntOrNull(textVal(record?.CriticalActivityFloatLimit)),
    criticalActivityPathType: textVal(record?.CriticalActivityPathType) ?? '',
    currBLProjectObjectId: parseIntOrNull(textVal(record?.CurrentBaselineProjectObjectId)),
    dataDate: formatDate(textVal(record?.DataDate)),
    dateAdded: formatDate(textVal(record?.DateAdded)),
    defaultPriceTimeUnits: textVal(record?.DefaultPriceTimeUnits) ?? '',
    discountApplicationPeriod: textVal(record?.DiscountApplicationPeriod) ?? '',
    earnedValueComputeType: textVal(record?.EarnedValueComputeType) ?? '',
    earnedValueETCComputeType: textVal(record?.EarnedValueETCComputeType) ?? '',
    earnedValueETCUserValue: parseFloatOrNull(textVal(record?.EarnedValueETCUserValue)),
    earnedValueUserPercent: parseFloatOrNull(textVal(record?.EarnedValueUserPercent)),
    enableSummarization: parseBool(textVal(record?.EnableSummarization)),
    financialPeriodTemplateId: parseIntOrNull(textVal(record?.FinancialPeriodTemplateId)),
    fiscalYearStartMonth: parseIntOrNull(textVal(record?.FiscalYearStartMonth)),
    guid: textVal(record?.GUID) ?? '00000000-0000-0000-0000-000000000000',
    id: textVal(record?.Id) ?? '',
    independentETCLaborUnits: parseFloatOrNull(textVal(record?.IndependentETCLaborUnits)),
    independentETCTotalCost: parseFloatOrNull(textVal(record?.IndependentETCTotalCost)),
    lastFinPeriodObjectId: parseIntOrNull(textVal(record?.LastFinancialPeriodObjectId)),
    levelingPriority: parseIntOrNull(textVal(record?.LevelingPriority)),
    linkActualToActThisPeriod: parseBool(textVal(record?.LinkActualToActualThisPeriod)),
    linkPerCompleteWithActual: parseBool(textVal(record?.LinkPercentCompleteWithActual)),
    linkPlannedAndAtComplFlag: parseBool(textVal(record?.LinkPlannedAndAtCompletionFlag)),
    mustFinishByDate: formatDate(textVal(record?.MustFinishByDate)),
    name: textVal(record?.Name) ?? '',
    obsObjectId: parseIntOrNull(textVal(record?.OBSObjectId)),
    originalBudget: parseFloatOrNull(textVal(record?.OriginalBudget)),
    parentEPSObjectId: parseIntOrNull(textVal(record?.ParentEPSObjectId)),
    plannedStartDate: formatDate(textVal(record?.PlannedStartDate)),
    primResCanMarkActAsCompl: parseBool(textVal(record?.PrimaryResourcesCanMarkActivitiesAsCompleted)),
    projectForecastStartDate: formatDate(textVal(record?.ProjectForecastStartDate)),
    resCanAssignThemselToAct: parseBool(textVal(record?.ResourcesCanAssignThemselvesToActivities)),
    resCanBeAssToSameActMoreOnce: parseBool(textVal(record?.ResourceCanBeAssignedToSameActivityMoreThanOnce)),
    resetPlannToRemainingFlag: parseBool(textVal(record?.ResetPlannedToRemainingFlag)),
    scheduledFinishDate: formatDate(textVal(record?.ScheduledFinishDate)),
    status: ['Active', 'Inactive'].includes(textVal(record?.Status) ?? '') ? textVal(record?.Status) : 'Active',
    strategicPriority: parseIntOrNull(textVal(record?.StrategicPriority)),
    summarizeToWBSLevel: parseIntOrNull(textVal(record?.SummarizeToWBSLevel)),
    summaryLevel: parseIntOrNull(textVal(record?.SummaryLevel)),
    uploadDate: selectedDate,
    useProjBLForEarnedValue: parseBool(textVal(record?.UseProjectBaselineForEarnedValue)),
    wbsCodeSeparator: textVal(record?.WBSCodeSeparator) ?? '',
    webSiteRootDirectory: textVal(record?.WebSiteRootDirectory) ?? '',
    webSiteURL: textVal(record?.WebSiteURL) ?? '',
  });

  const textVal = (v: any): string | null => {
    if (v == null) return null;
    if (Array.isArray(v)) return textVal(v[0]);
    if (typeof v === 'object') {
      if ('text' in v) return v.text;
      return ''; // empty/self-closing tag
    }
    return v;
  };

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

  const extractResourceFields = (record: any,selectedDate:string) => ({
    objectId: parseIntOrNull(textVal(record?.ObjectId)),
    autoComputeActuals: parseBool(textVal(record?.AutoComputeActuals)),
    calculateCostFromUnits: parseBool(textVal(record?.CalculateCostFromUnits)),
    calendarObjectId: parseIntOrNull(textVal(record?.CalendarObjectId)),
    currencyObjectId: parseIntOrNull(textVal(record?.CurrencyObjectId)),
    defaultUnitsPerTime: parseFloatOrNull(textVal(record?.DefaultUnitsPerTime)),

    emailAddress: getPrimitiveValue(record?.EmailAddress, 'address'),
    employeeId: getPrimitiveValue(record?.EmployeeId, 'id'),
    guid: isValidGuid(textVal(record?.GUID)) ? textVal(record?.GUID) : null,
    id: textVal(record?.Id),

    isActive: parseBool(textVal(record?.IsActive)),
    isOverTimeAllowed: parseBool(textVal(record?.IsOverTimeAllowed)),
    name: textVal(record?.Name)?.trim() || null,
    officePhone: getPrimitiveValue(record?.OfficePhone, 'number'),
    otherPhone: getPrimitiveValue(record?.OtherPhone, 'number'),
    overtimeFactor: parseFloatOrNull(textVal(record?.OvertimeFactor)),
    parentObjectId: parseIntOrNull(textVal(record?.ParentObjectId)),
    primaryRoleObjectId: parseIntOrNull(textVal(record?.PrimaryRoleObjectId)),

    resourceNotes: getPrimitiveValue(record?.ResourceNotes),
    resourceType: textVal(record?.ResourceType),
    sequenceNumber: parseIntOrNull(textVal(record?.SequenceNumber)),
    shiftObjectId: parseIntOrNull(textVal(record?.ShiftObjectId)),
    timesheetApprMngrObjectId: parseIntOrNull(textVal(record?.TimesheetApprMngrObjectId)),
    title: getPrimitiveValue(record?.Title),
    unitOfMeasureObjectId: parseIntOrNull(textVal(record?.UnitOfMeasureObjectId)),

    uploadDate: selectedDate,
    useTimesheets: parseBool(textVal(record?.UseTimesheets)),
    userObjectId: parseIntOrNull(textVal(record?.UserObjectId)),
  });



  const extractWBSFields = (record: any,selectedDate:string) => ({
    ProjectObjectId: textVal(record?.ProjectObjectId),
    ObjectId: parseIntOrNull(textVal(record?.ObjectId)),
    ParentObjectId: parseIntOrNull(textVal(record?.ParentObjectId)),

    AnticipatedFinishDate: (() => {
      const d = new Date(textVal(record?.AnticipatedFinishDate) || '');
      return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    })(),

    AnticipatedStartDate: (() => {
      const d = new Date(textVal(record?.AnticipatedStartDate) || '');
      return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    })(),

    Code: textVal(record?.Code) || '',
    EarnedValueComputeType: textVal(record?.EarnedValueComputeType) || '',
    EarnedValueETCComputeType: textVal(record?.EarnedValueETCComputeType) || '',
    EarnedValueETCUserValue: parseFloatOrNull(textVal(record?.EarnedValueETCUserValue)),
    EarnedValueUserPercent: parseFloatOrNull(textVal(record?.EarnedValueUserPercent)),
    IndependentETCLaborUnits: parseFloatOrNull(textVal(record?.IndependentETCLaborUnits)),
    IndependentETCTotalCost: parseFloatOrNull(textVal(record?.IndependentETCTotalCost)),
    Name: textVal(record?.Name) || '',
    OBSObjectId: textVal(record?.OBSObjectId),
    OriginalBudget: parseFloatOrNull(textVal(record?.OriginalBudget)),
    SequenceNumber: parseIntOrNull(textVal(record?.SequenceNumber)),
    Status: textVal(record?.Status),
    uploadDate: selectedDate,
    WBSCategoryObjectId: parseIntOrNull(textVal(record?.WBSCategoryObjectId)),
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

  const sendChunk = async (url: string, chunk: any[], token: string, payloadKey: string) => {
    const payload = { [payloadKey]: chunk };
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

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('./xmlWorker.ts', import.meta.url), { type: 'module' });

      workerRef.current.onerror = (e) => {
        setMessage(`Worker error: ${e.message}`);
        setLoading(false);
      };

      workerRef.current.onmessage = async (event) => {
        const { status, data, message: errorMsg, progress: parsingProgress } = event.data;
        if (status === 'progress') {
          setProgress(parsingProgress); // Parsing: 0–20%
          return;
        }

        if (status !== 'success') {
          setMessage('XML Parse Error: ' + errorMsg);
          setLoading(false);
          return;
        }

        const { wbsArray, projectArray, resourceArray, activityArray, resourceAssignmentArray, baselineActivityArray, baselineProjectArray, baselineResourceArray, baselineWbsArray, baselineRaArray, calendarArray } = data;
        console.log('Parsed Data from Worker:', data);
        if (
          wbsArray.length === 0 &&
          projectArray.length === 0 &&
          resourceArray.length === 0 &&
          activityArray.length === 0 &&
          resourceAssignmentArray.length === 0
        ) {
          setMessage('❗ Parsed XML has no usable data. Please check file format.');
          setLoading(false);
          return;
        }

        try {
          setMessage('Fetching access token...');
          const token = await getAccessToken();
          let progressVal = 20; // after parsing

          const updateProgress = (delta: number) => {
            progressVal += delta;
            setProgress(Math.min(Math.round(progressVal), 100));
          };

          const validateRecord = (rec: any) => {
            for (const [key, value] of Object.entries(rec)) {
              if (typeof value === 'object' && value !== null) {
                console.error(`Invalid nested object at "${key}":`, value);
              }
            }
          };


          const bindSelectedDate = (
  extractor: (record: any, date: string) => any,
  date: string
) => (record: any) => extractor(record, date);

          const sendChunks = async (
            array: any[],
            extractFn: any,
            url: string,
            key: string,
            progressIncrement: number
          ) => {
            const totalChunks = Math.ceil(array.length / chunkSize);
            if (totalChunks === 0) return;

            for (let i = 0; i < array.length; i += chunkSize) {
              const chunk = array
                .slice(i, i + chunkSize)
                .map(extractFn)
                .filter((rec: any): rec is object => {
                  validateRecord(rec);
                  return rec !== null;
                });

              // console.log("chunk: ", chunk);
              if (chunk.length > 0) {
                await sendChunk(url, chunk, token, key);
              }

              updateProgress(progressIncrement / totalChunks);
            }
          };

// Sending Calendar Data
setMessage('Sending Calendar data...');
await sendChunks(
  calendarArray,
  bindSelectedDate(extractCalendarFields, selectedDateRef.current),
  `${baseUrl}/p6calendars`,
  'calendars',
  13.33
);

// Sending Resource Data
setMessage('Sending Resource data...');
await sendChunks(
  resourceArray,
  bindSelectedDate(extractResourceFields, selectedDateRef.current),
  `${baseUrl}/p6resources`,
  'resources',
  13.33
);

// Sending Project Data 
setMessage('Sending Project data...');
for (const record of projectArray) {
  const obj = extractProjectFields(record, selectedDateRef.current);
  await sendRecord(`${baseUrl}/projects`, obj, token);
}
updateProgress(13.33);

// Sending WBS Data
setMessage('Sending WBS data...');
await sendChunks(
  wbsArray,
  bindSelectedDate(extractWBSFields, selectedDateRef.current),
  `${baseUrl}/p6wbsstagingroots`,
  'wbss',
  13.33
);

// Sending Activity Data
setMessage('Sending Activity data...');
const allActivities = [
  ...activityArray.map((item: any) => ({ ...item, activityType: 'Project' })),
  ...baselineActivityArray.map((item: any) => ({ ...item, activityType: 'BaseLine' })),
];
await sendChunks(
  allActivities,
  bindSelectedDate(extractActivityFields, selectedDateRef.current),
  `${baseUrl}/p6activityroots`,
  'activitys',
  13.33
);

// Sending ResourceAssignment Data
setMessage('Sending ResourceAssignment data...');
await sendChunks(
  resourceAssignmentArray,
  bindSelectedDate(extractResourceAssignmentFields, selectedDateRef.current),
  `${baseUrl}/p6resourceassignmentroots`,
  'resourceassignments',
  13.33
);


          setMessage('✅ All data successfully sent to Business Central.');
          setProgress(100);
        } catch (err: any) {
          console.error(err);
          setMessage(`❌ Error: ${err.message}`);
        }

        setLoading(false);
      };
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setMessage('✅ File selected. Ready to send to Business Central.');
  };

  const handleSendToBC = () => {
    if (!selectedFile) {
      setMessage('❗ Please select a file first.');
      return;
    }

    setMessage('🔄 Parsing XML file...');
    setLoading(true);
    workerRef.current?.postMessage(selectedFile);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
        padding: '2rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '24px',
          }}
        >
          Upload Your File
        </h2>

        {/* File Input */}
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#374151',
            fontWeight: 500,
            marginBottom: '24px',
            width: '100%',
          }}
        >
          Select File:
          <input
            type="file"
            accept=".xml"
            onChange={handleFileUpload}
            style={{
              marginTop: '8px',
              fontSize: '14px',
              padding: '6px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              width: '100%',
              color: '#4b5563',
            }}
          />
        </label>

        {/* Date Input */}
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#4d4d4d',
            fontWeight: 'bold',
            width: '100%',
            marginBottom: '16px',
          }}
        >
          Select Upload Date:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={{
              marginTop: '8px',
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              fontSize: '14px',
            }}
          />
        </label>

        {/* Submit Button */}
        <button
          onClick={handleSendToBC}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#0078D4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            fontSize: '16px',
            marginTop: '12px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#005a9e')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0078D4')}
        >
          Process Primavera Data
        </button>

        {/* Status Message */}
        {message && (
          <p
            style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#374151',
              backgroundColor: '#f9fafb',
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            {message}
          </p>
        )}

        {/* Progress Bar */}
        {progress > 0 && (
          <div
            style={{
              width: '100%',
              backgroundColor: '#d1d1d1',
              borderRadius: '6px',
              marginTop: '16px',
              height: '28px',
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#4caf50', // ✅ Green color always
                color: 'white',
                textAlign: 'center',
                lineHeight: '28px',
                transition: 'width 0.3s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {progress}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;