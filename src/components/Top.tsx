import * as React from 'react';
import * as _ from 'lodash';
import {Card, Feed, Label, Segment, Statistic, Menu} from 'semantic-ui-react';
import Emojify from 'react-emojione';
import * as moment from 'moment';
import {Moment} from 'moment';
import {MINUTES_PER_SPECIFIC_DAYS, SIMPLE_FORMAT, MINUTES_PER_DAY, DATE_FORMAT} from "../storage/settings";


export interface Task {
    id: number;
    name: string;
    projectName: string;
    dueDate: Moment;
    elapsedMinutes: number;
    dateString: string;
}

export interface TaskFeedProps {
    name: string;
    project: string;
    elapsedMinutes: number;
}

export const TaskFeed = (props: TaskFeedProps) =>
    <Feed.Event>
        <Feed.Label image='https://blog.todoist.com/wp-content/uploads/2015/09/todoist-logo.png'/>
        <Feed.Content>
            <Feed.Date content={props.project}/>
            <Feed.Summary>
                <Emojify style={{height: 20, width: 20}}>{props.name}</Emojify>
            </Feed.Summary>
        </Feed.Content>
        <Label color='teal' circular style={{width: 25, height: 20, textAlign: 'center'}}>{props.elapsedMinutes}</Label>
    </Feed.Event>;


export interface DailyCardProps {
    date: Moment;
    tasks: Task[];
}

const colorMap = (time: number) => {
    if (time < -120) return "red";
    if (time < -60) return "violet";
    if (time <= 0) return "orange";
    return "green";
};

export const DailyCard = (props: DailyCardProps) => {
    const totalElapsedMinutes = _.sumBy(
        props.tasks.filter(t => t.dateString !== '毎日' && t.dateString !== '平日'),
        t => t.elapsedMinutes
    );
    const specifiedMinutes = MINUTES_PER_SPECIFIC_DAYS[props.date.format(SIMPLE_FORMAT)];
    const freeMinutes = (specifiedMinutes !== undefined ? specifiedMinutes : MINUTES_PER_DAY) - totalElapsedMinutes;

    const toTaskFeed = (task: Task) =>
        <TaskFeed
            key={task.id}
            name={task.name}
            project={task.projectName}
            elapsedMinutes={task.elapsedMinutes}
        />;

    return (
        <Card>
            <Segment inverted>
                <Statistic size='mini' color="olive">
                    <Statistic.Value>{props.date.format(DATE_FORMAT)}</Statistic.Value>
                </Statistic>
                <Label.Group>
                    <Label color={colorMap(freeMinutes)}>
                        Total
                        <Label.Detail>{totalElapsedMinutes}</Label.Detail>
                    </Label>
                    <Label color={colorMap(freeMinutes)}>
                        Reminding
                        <Label.Detail>{freeMinutes}</Label.Detail>
                    </Label>
                </Label.Group>
            </Segment>
            <Card.Content>
                <Feed>
                    {props.tasks
                        .filter(t => t.dateString !== '毎日' && t.dateString !== '平日')
                        .map(toTaskFeed)
                    }
                </Feed>
            </Card.Content>
        </Card>
    );
};

const isWeekDay = (date: Moment): boolean => date.day() > 0 && date.day() < 6;
const isMonDay = (date: Moment): boolean => date.day() === 1;
const isTuesDay = (date: Moment): boolean => date.day() === 2;
const isWednesDay = (date: Moment): boolean => date.day() === 3;
const isThursDay = (date: Moment): boolean => date.day() === 4;
const isFriDay = (date: Moment): boolean => date.day() === 5;

const inTheDay = (task: Task, date: Moment): boolean => {
    if (date.format(SIMPLE_FORMAT) === task.dueDate.format(SIMPLE_FORMAT)) {
        return true;
    }

    return date.isSameOrAfter(task.dueDate) && _.some([
            task.dateString === '毎日',
            task.dateString === '平日' && isWeekDay(date),
            task.dateString === '毎週月曜' && isMonDay(date),
            task.dateString === '毎週火曜' && isTuesDay(date),
            task.dateString === '毎週水曜' && isWednesDay(date),
            task.dateString === '毎週木曜' && isThursDay(date),
            task.dateString === '毎週金曜' && isFriDay(date),
        ]);
};

export interface TopProps {
    tasks: Task[];
}

export const Top = (props: TopProps) => {
    const dates: Moment[] = _(_.range(0, 30))
        .map(i => moment().startOf('week').add(i, 'day'))
        .filter(isWeekDay)
        .value();

    const toDailyCard = (date: Moment) =>
        <DailyCard
            key={date.toString()}
            date={date}
            tasks={props.tasks.filter(t => inTheDay(t, date))}
        />;

    return (
        <div>
            <Menu stackable inverted>
                <Menu.Item>
                    <img src='https://blog.todoist.com/wp-content/uploads/2015/09/todoist-logo.png'/>
                </Menu.Item>
                <Menu.Item>
                    <h2>Owlora</h2>
                </Menu.Item>
            </Menu>
            <div style={{padding: 10}}>
                <Card.Group itemsPerRow={5}>
                    {dates.map(toDailyCard)}
                </Card.Group>
            </div>
        </div>
    );
};
