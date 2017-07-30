import * as React from 'react';
import {Component} from 'react';
import * as _ from 'lodash';
import {Dictionary} from 'lodash';
import Emojify from 'react-emojione';
import {Card, Dimmer, Icon, Label, Message, Popup, Progress, Segment, Statistic} from 'semantic-ui-react';
import {Moment, now} from 'moment';
import {DATE_FORMAT, SIMPLE_FORMAT} from '../storage/settings';
import Task, {TaskUpdateParameter} from '../models/Task';
import TaskSortField from '../constants/TaskSortField';
import Order from '../constants/Order';
import {DragSource, DropTarget} from 'react-dnd';
import {findDOMNode} from 'react-dom';
import {TaskFeeds} from "./TaskFeeds";
import ImageOrEmoji from './ImageOrEmoji';
import CardAppearance from '../constants/CardAppearance';


const Fire = ({minutes}: { minutes: number }) =>
    <span>
        <Icon name="fire"/><Icon name="fire"/><Icon name="fire"/>
        Lack {minutes} <Icon name="heart"/>
        <Icon name="fire"/><Icon name="fire"/><Icon name="fire"/>
    </span>;

const Milestone = ({header, body}: { header: string, body: string }) =>
    <Message icon color="violet">
        <Icon name='diamond'/>
        <Message.Content>
            <Message.Header><Emojify>{header}</Emojify></Message.Header>
            <p><Emojify>{body}</Emojify></p>
        </Message.Content>
    </Message>;

export interface DailyCardProps {
    date: Moment;
    tasks: Task[];
    taskSortField: TaskSortField;
    taskOrder: Order;
    appearance: CardAppearance;
    minutesToUsePerDay: number;
    minutesToUsePerSpecificDays: Dictionary<number>;

    connectDropTarget?: Function;
    isOver?: boolean;
    canDrop?: boolean;

    onUpdateTask: (parameter: TaskUpdateParameter) => void;
}


@DropTarget(
    'task-feed',
    {
        drop(props: DailyCardProps, monitor) {
            if (monitor.didDrop()) {
                return;
            }

            return {
                date: props.date
            };
        },

        canDrop(props: DailyCardProps, monitor) {
            return !_.includes(props.tasks.map(x => x.id), monitor.getItem().id)
        }
    },
    (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
    })
)
export default class extends Component<DailyCardProps> {
    render() {
        const estimatedTasks: Task[] = _(this.props.tasks)
            .filter(t => t.dateString !== '毎日' && t.dateString !== '平日')
            .reject(t => t.isMilestone)
            .value();

        const totalEstimatedMinutes = _.sumBy(estimatedTasks, t => t.estimatedMinutes);
        const specifiedMinutes = this.props.minutesToUsePerSpecificDays[this.props.date.format(SIMPLE_FORMAT)];
        const minutesToUse = specifiedMinutes !== undefined ? specifiedMinutes : this.props.minutesToUsePerDay;
        const freeMinutes = minutesToUse - totalEstimatedMinutes;

        return (
            <Card ref={node => this.props.connectDropTarget(findDOMNode(this))}>
                <Dimmer active={!this.props.canDrop && this.props.isOver}
                        style={{backgroundColor: "grey", opacity: 0.5}}
                        content=""/>
                <Dimmer active={this.props.canDrop && this.props.isOver}
                        style={{backgroundColor: "red", opacity: 0.5}}
                        content={
                            <div>
                                <h2>Change duedate</h2>
                                <Icon name='arrow circle outline down' size='huge'/>
                            </div>
                        }/>
                <Dimmer active={this.props.date.isBefore(now(), 'day')} content={
                    <div>
                        <h2>Facing forward !!</h2>
                        <Icon name='hand outline right' size='huge'/>
                    </div>
                }/>
                <Segment inverted style={{margin: 0}}>
                    <Popup
                        flowing
                        trigger={
                            <Statistic size='mini' color="olive">
                                <Statistic.Value>{this.props.date.format(DATE_FORMAT)}</Statistic.Value>
                            </Statistic>
                        }
                        content={
                            <TaskFeeds tasks={estimatedTasks}
                                       taskSortField={this.props.taskSortField}
                                       taskOrder={this.props.taskOrder}
                            />
                        }
                    />
                    <Progress value={freeMinutes}
                              total={this.props.minutesToUsePerDay}
                              color="green"
                              size="small"
                              inverted
                              error={freeMinutes / this.props.minutesToUsePerDay < 0.20}
                              warning={freeMinutes / this.props.minutesToUsePerDay < 0.40}
                              disabled={minutesToUse === 0}
                    >
                        {
                            freeMinutes < 0
                                ?
                                <div>
                                    <Fire minutes={-freeMinutes}/>
                                    <Icon name="tasks" style={{marginLeft: 5}}/> {estimatedTasks.length}
                                </div>
                                :
                                <div>
                                    <Icon name="heart"/> {freeMinutes}
                                    <Icon name="tasks" style={{marginLeft: 5}}/> {estimatedTasks.length}
                                </div>
                        }
                    </Progress>
                </Segment>
                <Card.Content>
                    {this.props.tasks.filter(t => t.isMilestone)
                        .map(t => <Milestone key={t.id} header={t.projectName} body={t.name}/>)}
                    <Message info icon hidden={specifiedMinutes !== 0}>
                        <Icon name='smile'/>
                        <Message.Content>
                            <Message.Header>
                                Off time
                            </Message.Header>
                            <p>Enjoy without tasks</p>
                        </Message.Content>
                    </Message>
                    <Message negative icon hidden={freeMinutes >= 0}>
                        <Icon name='warning sign'/>
                        <Message.Content>
                            <Message.Header>
                                Move your tasks to other days!!
                            </Message.Header>
                        </Message.Content>
                    </Message>
                    <div style={
                        this.props.appearance === CardAppearance.DETAIL ?
                            {
                                opacity: 1,
                                maxHeight: "100%",
                                transform: "scaleY(1)",
                                transformOrigin: "top",
                                transition: "all 0.5s",
                            } :
                            {
                                opacity: 0,
                                maxHeight: 0,
                                transform: "scaleY(0)",
                                transformOrigin: "top",
                                transition: "all 0.5s",
                            }
                    }>
                        <TaskFeeds tasks={estimatedTasks}
                                   taskSortField={this.props.taskSortField}
                                   taskOrder={this.props.taskOrder}
                                   onUpdateTask={this.props.onUpdateTask}/>
                    </div>
                </Card.Content>
                <Card.Content extra>
                    {
                        _(estimatedTasks)
                            .groupBy(t => t.icon)
                            .map((tasks: Task[]) => ({
                                icon: tasks[0].icon,
                                minutes: _.sumBy(tasks, t => t.estimatedMinutes),
                                tasks: tasks
                            }))
                            .orderBy(x => x.minutes, 'desc')
                            .map(x => (
                                <Popup
                                    flowing
                                    key={x.icon}
                                    trigger={
                                        <span style={{marginRight: 10}}>
                                            <ImageOrEmoji src={x.icon}/>
                                            <Label color='teal' circular>{x.minutes}</Label>
                                        </span>
                                    }
                                    content={
                                        <TaskFeeds tasks={x.tasks}
                                                   taskSortField={this.props.taskSortField}
                                                   taskOrder={this.props.taskOrder}
                                        />
                                    }
                                />
                            ))
                            .value()
                    }
                </Card.Content>
            </Card>
        );
    }
};
