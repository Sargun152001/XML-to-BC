import { SaxesParser, SaxesTagPlain } from 'saxes';

function stripNS(tagName: string): string {
  return tagName.split(':').pop() || '';
}

self.onmessage = async (e: MessageEvent<File>) => {
  const file = e.data;
  const decoder = new TextDecoder();
  const reader = file.stream().getReader();
  const totalSize = file.size;
  let bytesRead = 0;

  const activityArr: any[] = [];
  const raArr: any[] = [];
  const projectArr: any[] = [];
  const resourceArr: any[] = [];
  const wbsArr: any[] = [];
  const baselineActivityArr: any[] = [];
  const baselineRaArr: any[] = [];
  const baselineProjectArr: any[] = [];
  const baselineResourceArr: any[] = [];
  const baselineWbsArr: any[] = [];

  const calendarArr: any[] = [];

  const stack: any[] = [];
  let currentText = '';
  let insideBaselineProject = false;

  const parser = new SaxesParser({ xmlns: false });

  parser.on('opentag', (tag: SaxesTagPlain) => {
    const tagName = stripNS(tag.name);
    const obj: any = { ...tag.attributes, __tag: tagName };
    if (tagName === 'BaselineProject') insideBaselineProject = true;
    stack.push({ tagName, obj });
    currentText = '';
  });

  parser.on('text', (text: string) => {
    currentText += text;
  });

  parser.on('cdata', (data: string) => {
    currentText += data;
  });

  parser.on('closetag', (tag: SaxesTagPlain) => {
    const tagName = stripNS(tag.name);
    const { obj } = stack.pop()!;
    obj.text = currentText.trim() || null;
    currentText = '';

    if (tagName === 'Calendar') {
      // console.log("Calendar OBJ: ", obj)
      const calendarName = obj.Name ?? '';
      const objectId = obj.ObjectId ?? '';
      const hoursPerDay = obj.HoursPerDay ?? '';
      const hoursPerWeek = obj.HoursPerWeek ?? '';
      const hoursPerMonth = obj.HoursPerMonth ?? '';
      const hoursPerYear = obj.HoursPerYear ?? '';

      // ---- StandardWorkWeek
      const standardWorkWeek = obj.StandardWorkWeek;
      // ---- StandardWorkHours
      const standardWorkHours = Array.isArray(standardWorkWeek?.StandardWorkHours)
        ? standardWorkWeek.StandardWorkHours
        : standardWorkWeek?.StandardWorkHours ? [standardWorkWeek.StandardWorkHours] : [];

      for (const swh of standardWorkHours) {
        const day = swh.DayOfWeek ?? '';

        const workTimes = Array.isArray(swh.WorkTime)
          ? swh.WorkTime
          : swh.WorkTime ? [swh.WorkTime] : [];

        if (workTimes.length === 0) {
          calendarArr.push({
            Type: 'Work',
            CalendarName: calendarName,
            ObjectId: objectId,
            HoursPerDay: hoursPerDay,
            HoursPerWeek: hoursPerWeek,
            HoursPerMonth: hoursPerMonth,
            HoursPerYear: hoursPerYear,
            DayOrDate: day,
            StartTime: '',
            FinishTime: '',
          });
        } else {
          for (const wt of workTimes) {
            calendarArr.push({
              Type: 'Work',
              CalendarName: calendarName,
              ObjectId: objectId,
              HoursPerDay: hoursPerDay,
              HoursPerWeek: hoursPerWeek,
              HoursPerMonth: hoursPerMonth,
              HoursPerYear: hoursPerYear,
              DayOrDate: day,
              StartTime: wt?.Start?.text ?? wt?.Start ?? '',
              FinishTime: wt?.Finish?.text ?? wt?.Finish ?? '',
            });
          }
        }
      }

      // ---- HolidayOrExceptions
      const holidayOrExceptions = obj.HolidayOrExceptions;
      // ---- HolidayOrException
      const holidayOrException = Array.isArray(holidayOrExceptions?.HolidayOrException)
        ? holidayOrExceptions.HolidayOrException
        : holidayOrExceptions?.HolidayOrException ? [holidayOrExceptions.HolidayOrException] : [];

      for (const hex of holidayOrException) {
        const date = hex.Date ?? '';
        const workTimes = Array.isArray(hex.WorkTime)
          ? hex.WorkTime
          : hex.WorkTime ? [hex.WorkTime] : [];

        if (workTimes.length === 0) {
          calendarArr.push({
            Type: 'Holiday',
            CalendarName: calendarName,
            ObjectId: objectId,
            HoursPerDay: hoursPerDay,
            HoursPerWeek: hoursPerWeek,
            HoursPerMonth: hoursPerMonth,
            HoursPerYear: hoursPerYear,
            DayOrDate: date,
            StartTime: '',
            FinishTime: '',
          });
        } else {
          for (const wt of workTimes) {
            calendarArr.push({
              Type: 'Holiday',
              CalendarName: calendarName,
              ObjectId: objectId,
              HoursPerDay: hoursPerDay,
              HoursPerWeek: hoursPerWeek,
              HoursPerMonth: hoursPerMonth,
              HoursPerYear: hoursPerYear,
              DayOrDate: date,
              StartTime: wt.Start ?? '',
              FinishTime: wt.Finish ?? '',
            });
          }
        }
      }
    }


    if (tagName === 'BaselineProject') {
      baselineProjectArr.push(obj);
      insideBaselineProject = false;
      return;
    }

    if (['Activity', 'ResourceAssignment', 'Project', 'Resource', 'WBS'].includes(tagName)) {
      if (insideBaselineProject) {
        switch (tagName) {
          case 'Activity': baselineActivityArr.push(obj); break;
          case 'ResourceAssignment': baselineRaArr.push(obj); break;
          case 'Project': baselineProjectArr.push(obj); break;
          case 'Resource': baselineResourceArr.push(obj); break;
          case 'WBS': baselineWbsArr.push(obj); break;
        }
      } else {
        switch (tagName) {
          case 'Activity': activityArr.push(obj); break;
          case 'ResourceAssignment': raArr.push(obj); break;
          case 'Project': projectArr.push(obj); break;
          case 'Resource': resourceArr.push(obj); break;
          case 'WBS': wbsArr.push(obj); break;
        }
      }
    }

    if (stack.length) {
      const parent = stack[stack.length - 1].obj;
      const content = obj.text ?? obj;
      if (!parent[tagName]) {
        parent[tagName] = content;
      } else if (Array.isArray(parent[tagName])) {
        parent[tagName].push(content);
      } else {
        parent[tagName] = [parent[tagName], content];
      }
    }
  });

  parser.on('error', (err: Error) => {
    self.postMessage({ status: 'error', message: `SAX parser error: ${err.message}` });
    parser.close();
  });

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.length;
      parser.write(decoder.decode(value, { stream: true }));

      const progress = Math.min(20, Math.floor((bytesRead / totalSize) * 20));
      self.postMessage({ status: 'progress', progress });
    }

    parser.close();

    self.postMessage({
      status: 'success',
      data: {
        baselineActivityArray: baselineActivityArr,
        baselineProjectArray: baselineProjectArr,
        baselineResourceArray: baselineResourceArr,
        baselineWbsArray: baselineWbsArr,
        baselineRaArray: baselineRaArr,
        activityArray: activityArr,
        resourceAssignmentArray: raArr,
        projectArray: projectArr,
        resourceArray: resourceArr,
        wbsArray: wbsArr,
        calendarArray: calendarArr
      },
    });
  } catch (err: any) {
    self.postMessage({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error during XML parsing',
    });
  }
};
